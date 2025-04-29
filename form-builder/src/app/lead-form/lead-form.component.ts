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

  
  // submitForm() {
  //   if (!this.agreed) {
  //     alert('You must agree to the terms.');
  //     return;
  //   }
  //   console.log('Lead form submitted:', this.leadData);
  //   alert('Form Submitted Successfully!');
  // }


constructor(private visitorservice:visitorservice){}

  submitForm() {
    const leadFormData = Object.entries(this.leadData).map(([fieldName, value]) => ({ fieldName, value }));
  
    if (!this.visitorId) {
      console.error('Visitor ID not found!');
      return;
    }
  
    this.visitorservice.submitLead(this.visitorId, leadFormData).subscribe({
      next: (res) => {
        console.log("Visitor updated with lead form:", res);
      },
      error: (err) => {
        console.error('Failed to submit lead:', err);
      }
    });
  }
  
}
