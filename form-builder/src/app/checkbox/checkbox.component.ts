import { CommonModule } from '@angular/common';
import { Component ,Input,Output,EventEmitter} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  standalone:true,
  imports: [CommonModule,FormsModule],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.css'
})
export class CheckboxComponent {
  @Input() field: any;
  isChecked: boolean = false; // Changed from answer to isChecked for clarity

  @Output() answerSelected = new EventEmitter<{
    question: string;
    answer: string // Changed to boolean
    answerText: string;
    fieldType: string;
  }>();

  onInputChange() {
    this.answerSelected.emit({
      question: this.field.label || this.field.labelText,
      answer: this.isChecked.toString(),
      answerText: this.isChecked ? 'checked' : 'unchecked',
      fieldType: 'checkbox'
    });
  }
}
