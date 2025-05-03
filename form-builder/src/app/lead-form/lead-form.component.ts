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
    // Initialize leadData with empty values for all subfields
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
  
    console.log('Submitting lead data:', this.leadData);
    
    // Validate required fields
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

    // First update question stats
    this.visitorservice.updateQuestionStats(this.visitorId, [leadQuestionUpdate]).subscribe({
      next: () => {
        // Then submit lead data to database
        this.visitorservice.submitLead(this.visitorId, { data: leadFormData }).subscribe({
          next: (res) => {
            console.log("Lead form submitted and visitor updated:", res);
            
            // Trigger lead webhook with actual filled data
            if (this.formId) {
              console.log('Triggering lead webhook with data:', this.leadData);
              this.webhookService.triggerLeadWebhook(this.formId, this.leadData)
                .subscribe({
                  next: (webhookRes) => {
                    console.log('Lead webhook triggered with submitted data', webhookRes);
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
