import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css'
})
export class DropdownComponent {
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
      fieldType: 'dropdown' 
    });
  }
}