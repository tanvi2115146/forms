
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class visitorservice {
  private baseUrl = 'http://localhost:3000/visitor'; 

  constructor(private http: HttpClient) {}

  createVisitor() {
    return this.http.post<any>(`${this.baseUrl}/create-visitor`, {});
  }
  
  submitLead(visitorId: string, leadForm: any[]) {
    return this.http.put<any>(`${this.baseUrl}/submit-lead/${visitorId}`, { leadForm });
  }

  
  
}
