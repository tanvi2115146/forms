

// form.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FormService {
  private baseUrl = 'http://localhost:3000/forms'; 

  constructor(private http: HttpClient) {}

  saveForm(userId: string, formId: string, formName:string,fields: any[]) {
    return this.http.post(`${this.baseUrl}/save`, {formId,formName,fields });
  }
  
  getFormByUserId(userId: string) {
    return this.http.get<any[]>(`${this.baseUrl}/getforms/${userId}`);
  }

  getFormByFormId(formId: string) {
    return this.http.get<any>(`${this.baseUrl}/getform/${formId}`);
  }

  createForm(userId: string) {
    return this.http.post<any>(`${this.baseUrl}/createform`, { userId });
  }
  

  
}
