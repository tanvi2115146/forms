

import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormService } from '../../services/form.service';
import { PreviewComponent } from '../preview/preview.component';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, PreviewComponent],
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.css'],
})
export class FormBuilderComponent {
  fieldTypes = [
    { type: 'text', label: 'Text Input' },
    { type: 'dropdown', label: 'Dropdown', options: [{ value: 'option1' }, { value: 'option2' }] },
    { type: 'radio', label: 'Single Select', options: [{ value: 'first' }, { value: 'second' }, { value: 'third' }] },
  ];

  formFields: any[] = [];
  selectedField: any = null;
  userId: string = '';
  formId: string = '';


  ngOnInit() {
    this.formId = this.route.snapshot.paramMap.get('formId') || '';
    if (this.formId) {
      this.formService.getFormByFormId(this.formId).subscribe({
        next: (res: any) => {
          this.formFields = res.fields; 
        },
        error: (err) => console.error('Error loading form:', err)
      });
    }
    
  }

  constructor(
    private formService: FormService,
    private auth: AuthService,
    private route: ActivatedRoute
  ) {
    this.userId = this.auth.getUserId();
    
  }

  

  addField(field: any) {
    const newField = { ...field, label: field.label, placeholder: '', options: field.options ? [...field.options] : [] };
    this.formFields.push(newField);
    this.selectedField = newField;
  }

  addOption() {
    if (this.selectedField && this.selectedField.options) {
      this.selectedField.options.push({ value: '' });
    }
  }

  removeOption(index: number) {
    if (this.selectedField && this.selectedField.options) {
      this.selectedField.options.splice(index, 1);
    }
  }

  saveForm() {
    if (!this.formId) {
      alert('Form ID is missing. Please create a form first.');
      return;
    }
    this.formService.saveForm(this.userId, this.formId, this.formFields).subscribe({
      next: () => {
        alert('Form saved successfully');
      },
      error: (err) => {
        console.error('Error saving form:', err);
        alert('Failed to save form. Please try again.');
      },
    });
  }
}