// preview.component.ts
import { Component,Input , SimpleChanges,Output,EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextComponent } from '../../pages/text/text.component';
import { DropdownComponent } from '../../pages/dropdown/dropdown.component';
import { RadioComponent } from '../../pages/radio/radio.component';
import { ActivatedRoute ,Router} from '@angular/router';
import { FormService } from '../../services/form.service';
import { LeadFormComponent } from '../../lead-form/lead-form.component';
import { CheckboxComponent } from '../../checkbox/checkbox.component';
import { visitorservice } from '../../services/visitor.service';
import { v4 as uuidv4 } from 'uuid';


@Component({
  selector: 'app-preview',
  standalone:true,
  imports:[CommonModule,TextComponent,DropdownComponent,RadioComponent,LeadFormComponent,CheckboxComponent],
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent {
  @Input() formFields: any[] = [];
  @Input() isPreviewOnly: boolean = true;

  currentIndex:number=0;
  isPreviewRoute: boolean = false; 
  visitorId: string = '';

 
  questionStats: {
    questionId: string;
    question: string;
    answer: boolean;
    answerText: string;
    fieldType: string;
  }[] = [];

  @Output() statsUpdated = new EventEmitter<any[]>();



  constructor(private route:ActivatedRoute,
    private formService:FormService,
    private router:Router,
    private visitorservice:visitorservice){}




  ngOnInit() {
    const currentUrl = this.router.url;
    this.isPreviewRoute = currentUrl.includes('/preview/');
    const formId = this.route.snapshot.paramMap.get('formId');

    if (this.isPreviewOnly && formId) {
      this.loadFormAndCreateVisitor(formId);
    }
  }

  private loadFormAndCreateVisitor(formId: string) {
    this.formService.getFormByFormId(formId).subscribe({
      next: (res: any) => {
        this.formFields = res.fields || [];
        console.log('Fetched fields:', this.formFields);
        this.createNewVisitor(formId);
      },
      error: (err) => {
        console.error('Error loading form:', err);
        this.formFields = [];
      }
    });
  }


private createNewVisitor(formId: string) {
  const hasLeadForm = this.formFields.some(f => f.type === 'lead');
  
  this.formFields.forEach(field => {
    if (!field._id) {
      field._id = uuidv4();
    }
    if (!field.type) {
      field.type = 'text'; 
    }
  });

  this.visitorservice.createVisitor(formId, this.formFields).subscribe({
    next: (res) => {
      this.visitorId = res._id;
      
      // Initialize question stats for all fields
      const initialStats = this.formFields.map(field => ({
        questionId: field._id,
        question: field.label || field.type,
        answer: false,
        answerText: '',
        fieldType: field.type
      }));
      
      this.visitorservice.updateQuestionStats(this.visitorId, initialStats).subscribe({
        next: updated => console.log("Initial stats updated:", updated),
        error: err => console.error("Error updating stats:", err)
      });
    },
    error: (err) => {
      console.error('Error creating visitor:', err);
    }
  });
}



  storeAnswer(answerObj: { question: string, answer: string, fieldType: string }) {
    if (!this.visitorId) {
      console.error('Visitor ID not found!');
      return;
    }
  
    const field = this.isPreviewRoute 
      ? this.formFields[this.currentIndex]
      : this.formFields.find(f => 
          f.label === answerObj.question && 
          f.type === answerObj.fieldType
        );
  
    if (!field) {
      console.error('Field not found');
      return;
    }
  
   
    const updatePayload = {
      questionId: field._id,
      question: answerObj.question,
      answer: answerObj.answer !== '', 
      answerText: answerObj.answer,
      fieldType: answerObj.fieldType
    };
  

    this.visitorservice.updateQuestionStats(this.visitorId, [updatePayload]).subscribe({
      next: (updated: any) => {
        console.log("Question updated:", updated);
        
        const existingIndex = this.questionStats.findIndex(q => q.questionId === field._id);
        if (existingIndex >= 0) {
          this.questionStats[existingIndex] = updatePayload;
        } else {
          this.questionStats.push(updatePayload);
        }
        
        
        this.statsUpdated.emit(this.questionStats);
      },
      error: (err: any) => console.error("Error updating question:", err)
    });
  }


  

  next(){
    if(this.currentIndex<this.formFields.length-1){
      this.currentIndex++;
    }
  }
  

  prev(){
    if(this.currentIndex>0){
      this.currentIndex--;
    }
  }


}




























