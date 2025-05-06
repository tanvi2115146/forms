import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { visitorservice } from '../services/visitor.service';
import { WebhookService } from '../services/webhook.service';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lead-form.component.html',
  styleUrl: './lead-form.component.css'
})
export class LeadFormComponent {
  @Input() field: any;
  leadData: any = {};
  agreed: boolean = false;
  @Input() visitorId: string = '';
  @Input() questionStats: { question: string, answer: string }[] = [];
  @Input() formId: string = '';

  constructor(
    private visitorservice: visitorservice,
    private webhookService: WebhookService
  ) {}

  ngOnInit() {
    
    if (this.field && this.field.subfields) {
      this.field.subfields.forEach((subfield: any) => {
        this.leadData[subfield.label] = '';
      });
    }
  }


  submitForm() {
    if (!this.field || !this.field.subfields) {
      console.error('Invalid lead form configuration');
      return;
    }
  

    let isValid = true;
    for (const subfield of this.field.subfields) {
      if (!this.leadData[subfield.label]) {
        console.error(`Missing required field: ${subfield.label}`);
        isValid = false;
      }
    }
    
    if (!isValid || !this.agreed) {
      alert('Please fill all required fields and agree to the terms.');
      return;
    }
  
    if (!this.visitorId) {
      console.error('Visitor ID not found!');
      return;
    }
  
  
    const leadFormData = Object.entries(this.leadData).map(([fieldName, value]) => ({ 
      fieldName, 
      value 
    }));
  
    const leadQuestionUpdate = {
      questionId: this.field._id,
      question: this.field.label,
      answer: true,
      answerText: JSON.stringify(this.leadData),
      fieldType: 'lead'
    };
  
    this.visitorservice.updateQuestionStats(this.visitorId, [leadQuestionUpdate]).subscribe({
      next: () => {
        this.visitorservice.submitLead(this.visitorId, { data: leadFormData }).subscribe({
          next: (res) => {
            console.log("Lead form submitted and visitor updated:", res);
            
            
            const webhookData: any = {};
            
            
            Object.entries(this.leadData).forEach(([key, value]) => {
              webhookData[key] = value;
            });
  
           
            if (this.formId) {
              this.webhookService.triggerLeadWebhook(
                this.formId, 
                webhookData
              ).subscribe({
                next: (webhookRes) => {
                  alert('Form submitted successfully!');
                },
                error: (err) => console.error('Lead webhook error', err)
              });
            }
          },
          error: (err) => {
            console.error('Failed to submit lead:', err);
            alert('Failed to submit form. Please try again.');
          }
        });
      },
      error: (err) => {
        console.error('Failed to update lead question:', err);
        alert('Failed to submit form. Please try again.');
      }
    });
  }
}
