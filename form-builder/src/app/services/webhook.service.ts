import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WebhookService {
  private baseUrl = 'http://localhost:3000/webhook';

  constructor(private http: HttpClient) {}

  createWebhook(formId: string, url: string, events: any = { lead: true, visit: true }) {
    console.log('Creating webhook config:', { formId, url, events });
    return this.http.post(`${this.baseUrl}/create`, { formId, url, events });
  }

  getWebhookConfig(formId: string) {
    return this.http.get<any>(`${this.baseUrl}/config/${formId}`);
  }

  triggerLeadWebhook(formId: string, leadData: any): Observable<any> {
    console.log('Triggering lead webhook with data:', leadData);
    
    return this.http.post(`${this.baseUrl}/trigger/lead`, { 
      formId, 
      data: leadData 
    }).pipe(
      tap(response => console.log('Lead webhook response:', response)),
      catchError((error: HttpErrorResponse) => {
        console.error('Lead webhook error:', error);
        throw new Error(
          error.error?.error || 
          error.error?.message || 
          'Failed to trigger lead webhook'
        );
      })
    );
  }

  triggerVisitWebhook(formId: string, visitData: any): Observable<any> {
    console.log('Triggering visit webhook for form:', formId);
    console.log('Payload data:', visitData);
    
    return this.http.post(`${this.baseUrl}/trigger/visit`, { 
      formId, 
      data: visitData 
    }).pipe(
      tap(response => console.log('Visit webhook response:', response)),
      catchError((error: HttpErrorResponse) => {
        console.error('Visit webhook error:', error);
        throw new Error(
          error.error?.error || 
          error.error?.message || 
          'Failed to trigger visit webhook'
        );
      })
    );
  }
}