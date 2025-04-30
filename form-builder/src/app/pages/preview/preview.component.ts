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
    const currentUrl=this.router.url;
    this.isPreviewRoute=currentUrl.includes('/preview/');

    const formId = this.route.snapshot.paramMap.get('formId');
    

    if (this.isPreviewOnly && formId) { 
      this.formService.getFormByFormId(formId).subscribe({
        next: (res: any) => {
          this.formFields = res.fields;
          console.log('Fetched fields:', this.formFields);

          this.visitorservice.createVisitor().subscribe({
            next: (visitor) => {
              this.visitorId = visitor._id;
              console.log('Visitor created:', visitor);
            },
            error: (err) => {
              console.error('Error creating visitor:', err);
            }
          });
        },
        error: (err) => {
          console.error('Error loading form fields:', err);
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
    const existing = this.questionStats.find(q => q.question === answerObj.question);
    if (existing) {
      existing.answer = answerObj.answer;
    } else {
      this.questionStats.push(answerObj);
    }
  
    console.log('Updated questionStats:', this.questionStats);
    this.statsUpdated.emit(this.questionStats); 
  }
  
  


}




























