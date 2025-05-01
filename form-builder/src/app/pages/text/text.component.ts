import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-text',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './text.component.html',
  styleUrl: './text.component.css'
})
export class TextComponent {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  answer: string = '';

  @Output() answerSelected = new EventEmitter<{
    question: string;
    answer: string;
    fieldType: string;
  }>();

  onInputChange() { 
    this.answerSelected.emit({
      question: this.label,
      answer: this.answer,
      fieldType: 'text'
    });
  }
}