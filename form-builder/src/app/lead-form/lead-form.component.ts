import { CommonModule } from '@angular/common';
import { Component,Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { visitorservice } from '../services/visitor.service';

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

constructor(private visitorservice: visitorservice) {}




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
      
      this.visitorservice.submitLead(this.visitorId, { data: leadFormData }).subscribe({
        next: (res) => {
          console.log("Lead form submitted and visitor updated:", res);
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

}
