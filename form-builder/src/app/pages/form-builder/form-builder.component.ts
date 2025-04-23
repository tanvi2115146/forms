import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormService } from '../../services/form.service';

@Component({
  selector: 'app-form-builder',
  standalone:true,
  imports: [CommonModule,FormsModule],
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.css']
})


export class FormBuilderComponent {
  fieldTypes = [
    { type: 'text', label: 'Text Input' },
    { type: 'dropdown', label: 'Dropdown', options: ['option1', 'option2'] },
    { type: 'radio', label: 'Single Select', options: ['first', 'second', 'third'] }
  ];

  formFields: any[] = [];
  selectedField: any = null;

  constructor(private FormService: FormService) {}

  addField(field: any) {
    const newField = { ...field, label: field.label, placeholder: '', options: field.options ? [...field.options] : [] };
    this.formFields.push(newField);
    this.selectedField = newField;
  }



  addOption() {
    if (this.selectedField && this.selectedField.options) {
      this.selectedField.options.push('');
    }
  }

  removeOption(index: number) {
    if (this.selectedField && this.selectedField.options) {
      this.selectedField.options.splice(index, 1);
    }
  }

  saveForm() {
    this.FormService.saveForm(this.formFields).subscribe(res => {
      alert('Form saved successfully');
    });
  }
}

