
import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormService } from '../../services/form.service';
import { PreviewComponent } from '../preview/preview.component';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import{Clipboard} from '@angular/cdk/clipboard';
import {Router} from '@angular/router';
import { visitorservice } from '../../services/visitor.service';


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
    { type: 'lead', label: 'Lead Generation Form', subfields: [
      { label: 'First Name', placeholder: 'Enter your first name' },
      { label: 'Email', placeholder: 'Enter your email' }
      ]
    },
      {label:'checkbox',type:'checkbox',labelText:'I agree to Terms'} 
  ];

  formFields: any[] = [];
  selectedField: any = null;
  userId: string = '';
  formId: string = '';
  formName:string='untitled form';
  isEditingName:boolean=false;


  ngOnInit() {
    this.formId = this.route.snapshot.paramMap.get('formId') || '';
    
    if (this.formId) {
      this.formService.getFormByFormId(this.formId).subscribe({
        next: (res: any) => {
          if (res.fields && res.fields.length > 0) {
           
            this.formFields = res.fields; 
          } else {
            this.setDefaultField(); 
          }
          this.formName=res.formName || 'untitled form';
        },
        error: (err) => {
          console.error('Error loading form:', err);
          this.setDefaultField(); 
        }
      });
    } else {
      this.setDefaultField(); 
    }
  }
  

  constructor(
    private formService: FormService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private clipboard:Clipboard,
    private router:Router,private visitorservice:visitorservice
   
  ) {
    this.userId = this.auth.getUserId();
    
  }

  
  addField(field: any) {
    const newField = { ...field, label: field.label, placeholder: '', options: field.options ? [...field.options] : [] ,
      subfields: field.subfields ? [...field.subfields] : [] , labelText: field.labelText || ''
    };
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



  setDefaultField() {
    const defaultNameField = {
      type: 'text',
      label: 'Name',
      placeholder: 'Enter your name',
    };
    this.formFields = [defaultNameField];
  }
  


  saveForm() {
    if (!this.formId) {
      alert('Form ID is missing. Please create a form first.');
      return;
    }
    this.formService.saveForm(this.userId, this.formId,this.formName,this.formFields).subscribe({
      next: () => {
        alert('Form saved successfully');
      },
      error: (err) => {
        console.error('Error saving form:', err);
        alert('Failed to save form. Please try again.');
      },
    });
  }


  copyLink() {
    const link = `${window.location.origin}/preview/${this.formId}`;
    this.clipboard.copy(link); 
    alert('Link copied to clipboard!');
  }
  
  goLive() {
    const url=this.router.serializeUrl(
      this.router.createUrlTree(['/preview', this.formId])
    );
    window.open(url, '_blank');
  }


// Add this method to your FormBuilderComponent
saveFormWithQuestions() {
  if (!this.formId) {
    alert('Form ID is missing. Please create a form first.');
    return;
  }

  // First save the form structure
  this.formService.saveForm(this.userId, this.formId, this.formName, this.formFields).subscribe({
    next: () => {
      // Then create visitor with initial question stats
      this.visitorservice.createVisitor(this.formId, this.formFields).subscribe({
        next: (visitor) => {
          console.log('Form and initial questions saved', visitor);
          alert('Form saved successfully');
        },
        error: (err) => {
          console.error('Error saving visitor questions:', err);
          alert('Form saved but question tracking failed');
        }
      });
    },
    error: (err) => {
      console.error('Error saving form:', err);
      alert('Failed to save form. Please try again.');
    }
  });
}


}