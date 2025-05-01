
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class visitorservice {
  private baseUrl = 'http://localhost:3000/visitor'; 

  constructor(private http: HttpClient) {}


  // createVisitor(formId: string, formFields?: any[]) {
  //   return this.http.post<any>(`${this.baseUrl}/create-visitor`, { 
  //     formId, 
  //     formFields 
  //   });
  // }


  createVisitor(formId: string, formFields?: any[], isLeadForm: boolean = false) {
    return this.http.post<any>(`${this.baseUrl}/create-visitor`, { 
      formId, 
      formFields,
      isLeadForm // Explicitly set initial value
    });
  }

  updateQuestionStats(visitorId: string, questionStats: any[]) {
    return this.http.patch<any>(`${this.baseUrl}/update-question/${visitorId}`, { questionStats });
  }

  submitLead(visitorId: string, data: any) {
    return this.http.put<any>(`${this.baseUrl}/submit-lead/${visitorId}`, { data });
  }
  
}
