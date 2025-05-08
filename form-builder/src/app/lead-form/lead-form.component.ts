
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  @Input() questionStats: any[] = [];
  @Input() formId: string = '';
  @Output() answerChanged = new EventEmitter<any>();
  
  // Add webhook config as input property
  @Input() webhookConfig: any = { url: '', events: { lead: false, visit: true } };

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
    
    // If formId exists, get the webhook config
    if (this.formId) {
      this.webhookService.getWebhookConfig(this.formId).subscribe({
        next: (config) => {
          this.webhookConfig = config || { url: '', events: { lead: false, visit: true } };
          console.log('Lead form received webhook config:', this.webhookConfig);
        },
        error: (err) => console.error('Error loading webhook config:', err)
      });
    }
  }







onInputChange() {
  const hasData = Object.values(this.leadData).some(value => value !== '');

  if (this.field && this.field._id) {
    const updatedAnswer = {
      questionId: this.field._id,
      question: this.field.label,
      answer: hasData ? JSON.stringify(this.leadData) : '',
      answerText: hasData ? JSON.stringify(this.leadData) : '',
      fieldType: 'lead'
    };

    // Emit the answer to the parent component (if needed)
    this.answerChanged.emit({
      question: this.field.label,
      answer: hasData ? JSON.stringify(this.leadData) : '',
      fieldType: 'lead'
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
  
    // Update question stats in our local array too for webhooks
    const existingIndex = this.questionStats.findIndex(q => q.questionId === this.field._id);
    if (existingIndex >= 0) {
      this.questionStats[existingIndex] = leadQuestionUpdate;
    } else {
      this.questionStats.push(leadQuestionUpdate);
    }
  
    this.visitorservice.updateQuestionStats(this.visitorId, [leadQuestionUpdate]).subscribe({
      next: () => {
        this.visitorservice.submitLead(this.visitorId, { data: leadFormData }).subscribe({
          next: (res) => {
            console.log("Lead form submitted and visitor updated:", res);
            
            // First trigger visit webhook with updated lead data if enabled
            if (this.formId && this.webhookConfig?.events?.visit) {
              console.log('Triggering visit webhook with lead data');
              this.webhookService.triggerVisitWebhook(
                this.formId,
                this.questionStats
              ).subscribe({
                next: (visitRes) => {
                  console.log('Visit webhook updated with lead data', visitRes);
                  this.handleLeadWebhook();
                },
                error: (err) => {
                  console.error('Visit webhook error', err);
                  this.handleLeadWebhook(); // Still try lead webhook even if visit fails
                }
              });
            } else {
              this.handleLeadWebhook();
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
  
  // Separated lead webhook logic into its own method
  private handleLeadWebhook() {
    // Only trigger lead webhook if it's enabled in config
    if (this.formId && this.webhookConfig?.events?.lead) {
      console.log('Lead webhook is enabled, triggering...');
      
      // Prepare webhook data for lead-specific webhook
      const webhookData: any = {};
      
      // Add all lead form fields
      Object.entries(this.leadData).forEach(([key, value]) => {
        webhookData[key] = value;
      });

      // Add special field for MailerLite integration
      webhookData['visitorId'] = this.visitorId;
     
      this.webhookService.triggerLeadWebhook(
        this.formId, 
        webhookData
      ).subscribe({
        next: (webhookRes) => {
          console.log('Lead webhook success:', webhookRes);
          alert('Form submitted successfully!');
        },
        error: (err) => {
          console.error('Lead webhook error', err);
          // Still show success since the form data was saved, even if webhook failed
          alert('Form submitted successfully! (Note: webhook notification failed)');
        }
      });
    } else {
      console.log('Lead webhook is not enabled, skipping...');
      alert('Form submitted successfully!');
    }
  }
}