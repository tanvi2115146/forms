// preview.component.ts
import { Component,Input , SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextComponent } from '../../pages/text/text.component';
import { DropdownComponent } from '../../pages/dropdown/dropdown.component';
import { RadioComponent } from '../../pages/radio/radio.component';
import { ActivatedRoute } from '@angular/router';
import { FormService } from '../../services/form.service';



@Component({
  selector: 'app-preview',
  standalone:true,
  imports:[CommonModule,TextComponent,DropdownComponent,RadioComponent],
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent {
  @Input() formFields: any[] = [];
  @Input() isPreviewOnly: boolean = true;



  constructor(private route:ActivatedRoute,private formService:FormService){}


  ngOnInit() {
    if (this.isPreviewOnly) { 
      const formId = this.route.snapshot.paramMap.get('formId') || '';
      if (formId) {
        this.formService.getFormByFormId(formId).subscribe({
          next: (res: any) => {
            this.formFields = res.fields;
            console.log('Fetched fields:', this.formFields);
          },
          error: (err) => {
            console.error('Error loading form fields:', err);
          }
        });
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formFields']) {
      console.log('Form fields updated:', this.formFields);
    }
  }
  
  
}




























