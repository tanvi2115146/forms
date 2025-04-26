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

  constructor(private route:ActivatedRoute,private formService:FormService){}


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formFields']) {
      console.log('Form fields updated:', this.formFields);
    }
  }
  
  
}




























