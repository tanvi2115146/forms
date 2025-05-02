
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
import { WebhookService } from '../../services/webhook.service';
import { v4 as uuidv4 } from 'uuid';
import { HttpErrorResponse } from '@angular/common/http';

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
  formId: string = 'uuidv4()';
  formName:string='untitled form';
  isEditingName:boolean=false;
  webhookUrl: string = '';
  showWebhookDialog: boolean = false; 
  leadData: any = {};
  questionStats: any[] = [];

 
 
  webhookConfig = {
    url: '',
    events: {
      lead: true,
      visit: true
    }
  };



  

  ngOnInit() {
    this.formId = this.route.snapshot.paramMap.get('formId') || uuidv4();
    
    if (this.formId) {
      this.formService.getFormByFormId(this.formId).subscribe({
        next: (res: any) => {
          if (res?.fields?.length > 0) {
            this.formFields = res.fields;
          } else {
            this.setDefaultField();
          }
          this.formName = res?.formName || 'untitled form';
        },
        error: (err) => {
          console.error('Error loading form:', err);
          this.setDefaultField();
        }
      });
      
      // Load webhook config
      this.webhookService.getWebhookConfig(this.formId).subscribe(config => {
        this.webhookConfig = config || {
          url: '',
          events: { lead: true, visit: true }
        };
      });
    }
  }


  
  updateWebhookConfig() {
    this.webhookService.createWebhook(
      this.formId, 
      this.webhookConfig.url,
      this.webhookConfig.events
    ).subscribe({
      next: () => alert('Webhook configuration saved!'),
      error: (err) => console.error('Error saving webhook:', err)
    });
  }
  
  testWebhook(type: 'lead' | 'visit') {
    if (type === 'lead') {
      const testData = {
        'First Name': 'Test User',
        'Email': 'test@example.com'
      };
      this.webhookService.triggerLeadWebhook(this.formId, testData).subscribe();
    } else {
      const testData = this.formFields.map(field => ({
        questionId: field._id || uuidv4(),
        question: field.label || field.type,
        answer: false,
        answerText: '',
        fieldType: field.type
      }));
      this.webhookService.triggerVisitWebhook(this.formId, testData).subscribe();
    }
  

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
    private router:Router,private visitorservice:visitorservice,
    private webhookService: WebhookService
   
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
      this.formId = uuidv4(); // Ensure formId exists
    }
    
    this.formService.saveForm(this.userId, this.formId, this.formName, this.formFields).subscribe({
      next: () => {
        alert('Form saved successfully');
        // Update URL if this is a new form
        if (!this.route.snapshot.paramMap.get('formId')) {
          this.router.navigate(['/form-builder', this.formId]);
        }
      },
      error: (err) => {
        console.error('Error saving form:', err);
        alert('Failed to save form. Please try again.');
      }
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




saveFormWithQuestions() {
  if (!this.formId) {
    alert('Form ID is missing. Please create a form first.');
    return;
  }

  this.formService.saveForm(this.userId, this.formId, this.formName, this.formFields).subscribe({
    next: () => {
    
      this.visitorservice.createVisitor(this.formId, this.formFields, false).subscribe({
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




setupWebhook() {
  this.webhookService.createWebhook(
    this.formId, 
    this.webhookConfig.url,
    this.webhookConfig.events
  ).subscribe({
    next: () => alert('Webhook configured successfully'),
    error: (err) => console.error('Error setting up webhook:', err)
  });
}


async testLeadWebhook() {
  if (!this.webhookConfig.events.lead) {
    alert('Lead webhook is not enabled in configuration');
    return;
  }

  const leadField = this.formFields.find(f => f.type === 'lead');
  if (!leadField) {
    alert('No lead form field exists in this form');
    return;
  }

  const testLeadData = {
    'First Name': 'Test First Name',
    'Email': 'test@example.com'
  };

  console.log('Triggering lead webhook with:', testLeadData);

  try {
    const response = await this.webhookService.triggerLeadWebhook(
      this.formId, 
      testLeadData
    ).toPromise();
    
    console.log('Lead webhook response:', response);
    alert('Lead webhook triggered successfully!');
  } catch (err: unknown) {
    let errorMessage = 'Failed to trigger lead webhook';
    
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    } else if (err && typeof err === 'object' && 'error' in err) {
      errorMessage = (err as any).error.message || JSON.stringify(err);
    }

    console.error('Lead webhook failed:', err);
    alert(`Error: ${errorMessage}`);
  }
}

testVisitWebhook() {
  if (!this.webhookConfig.events.visit) {
    alert('Visit webhook is not enabled in configuration');
    return;
  }

  const testQuestionStats = this.formFields.map(field => ({
    questionId: field._id || uuidv4(),
    question: field.label || field.type,
    answer: false,
    answerText: '',
    fieldType: field.type
  }));
  
  this.webhookService.triggerVisitWebhook(this.formId, testQuestionStats)
    .subscribe({
      next: (response) => {
        console.log('Visit webhook triggered', response);
        alert('Test webhook sent successfully!');
      },
      error: (err) => {
        console.error('Error triggering visit webhook', err);
        alert(`Error: ${err.error?.error || err.message}`);
      }
    });
}





}