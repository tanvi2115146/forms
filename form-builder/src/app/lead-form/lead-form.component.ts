import { CommonModule } from '@angular/common';
import { Component,Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { visitorservice } from '../services/visitor.service';
import { WebhookService } from '../services/webhook.service';

@Component({
  selector: 'app-lead-form',
  standalone:true,
  imports: [CommonModule,FormsModule],
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



constructor(private visitorservice: visitorservice,private webhookService:WebhookService) {}




submitForm() {
  const leadFormData = Object.entries(this.leadData).map(([fieldName, value]) => ({ fieldName, value }));

  if (!this.visitorId) {
    console.error('Visitor ID not found!');
    return;
  }


  const leadQuestionUpdate = {
    questionId: this.field._id,
    question: this.field.label,
    answer: true,
    answerText: JSON.stringify(this.leadData),
    fieldType: 'lead'
  };

  this.visitorservice.updateQuestionStats(this.visitorId, [leadQuestionUpdate]).subscribe({
    next: () => {
      // Then submit lead data
      this.visitorservice.submitLead(this.visitorId, { data: leadFormData }).subscribe({
        next: (res) => {
          console.log("Lead form submitted and visitor updated:", res);
          
          // Trigger lead webhook with ACTUAL data (not test data)
          if (this.formId) {
            this.webhookService.triggerLeadWebhook(this.formId, this.leadData)
              .subscribe({
                next: (webhookRes) => console.log('Lead webhook triggered', webhookRes),
                error: (err) => console.error('Lead webhook error', err)
              });
          }
        },
        error: (err) => {
          console.error('Failed to submit lead:', err);
        }
      });
    },
    error: (err) => {
      console.error('Failed to update lead question:', err);
    }
  });
}



private submitToDatabase(data: any) {
  const leadFormData = Object.entries(data).map(([fieldName, value]) => ({ 
    fieldName, 
    value 
  }));
  
  this.visitorservice.submitLead(this.visitorId, { data: leadFormData })
    .subscribe({
      next: (res) => console.log('Database updated:', res),
      error: (err) => console.error('Database error:', err)
    });
}

}
