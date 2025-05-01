import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.css'
})
export class RadioComponent {
  @Input() field: any;
  answer: string = ''; 

  @Output() answerSelected = new EventEmitter<{
    question: string;
    answer: string;
    fieldType: string;
  }>();

  onInputChange() { 
    this.answerSelected.emit({
      question: this.field.label,
      answer: this.answer,
      fieldType: 'radio' 
    });
  }
}