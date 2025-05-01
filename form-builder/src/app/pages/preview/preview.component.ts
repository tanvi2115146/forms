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

  questionStats: { question: string, answer: string }[] = [];

  @Output() statsUpdated = new EventEmitter<any[]>();



  constructor(private route:ActivatedRoute,private formService:FormService,private router:Router,private visitorservice:visitorservice){}



  ngOnInit() {
    const currentUrl = this.router.url;
    this.isPreviewRoute = currentUrl.includes('/preview/');
    const formId = this.route.snapshot.paramMap.get('formId');
  
    if (this.isPreviewOnly && formId) {
      this.formService.getFormByFormId(formId).subscribe({
        next: (res: any) => {
          this.formFields = res.fields;
          console.log('Fetched fields:', this.formFields);
  
          const hasLeadForm = this.formFields.some(f => f.type === 'lead');
  
          this.visitorservice.createVisitor(formId!).subscribe({
            next: (res) => {
              console.log("Visitor created:", res);
              this.visitorId = res._id;
        
              const hasLeadForm = this.formFields.some(f => f.type === 'lead');
              const stat = { question: 'isLeadForm', answer: hasLeadForm, answerText: '' };
        
              this.visitorservice.updateQuestionStats(this.visitorId, [stat]).subscribe({
                next: updated => console.log("Visitor updated with isLeadForm:", updated)
              });
            }
          });
            },
            error: (err) => {
              console.error('Error creating visitor:', err);
            }
          });
       
    }
  }
  


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formFields']) {
      console.log('Form fields updated:', this.formFields);
    }
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

  
  storeAnswer(answerObj: { question: string, answer: string }) {
    const newStat = [{
      question: answerObj.question,
      answer: true,
      answerText: answerObj.answer
    }];
  
    this.visitorservice.updateQuestionStats(this.visitorId, newStat).subscribe({
      next: updated => console.log("question update:", updated)
    });
  }
  


}




























