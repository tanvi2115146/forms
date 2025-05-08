

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WebhookService {
  private baseUrl = 'http://localhost:3000/webhook';

  constructor(private http: HttpClient) {}

  createWebhook(formId: string, url: string, events: any = { lead: true, visit: true }) {
    console.log('Creating webhook config:', { formId, url, events });
    return this.http.post(`${this.baseUrl}/create`, { formId, url, events });
  }

  getWebhookConfig(formId: string) {
    return this.http.get<any>(`${this.baseUrl}/config/${formId}`).pipe(
      catchError((error) => {
        console.error('Error fetching webhook config:', error);
       
        return of({ url: '', events: { lead: false, visit: true } });
      })
    );
  }

  triggerLeadWebhook(formId: string, leadData: any): Observable<any> {
    console.log('Triggering lead webhook with data:', leadData);
    
   
    if (!leadData['First Name'] || !leadData['Email']) {
      console.error('Missing required fields for lead webhook');
      return throwError(() => new Error('Missing required lead form fields (First Name and Email)'));
    }
    
    return this.http.post(`${this.baseUrl}/trigger/lead`, { 
      formId, 
      data: leadData 
    }).pipe(
      tap(response => console.log('Lead webhook response:', response)),
      catchError((error: HttpErrorResponse) => {
        
        if (error.status === 400 && 
            (error.error?.error === 'Lead webhook not enabled' || 
             error.error?.message?.includes('not enabled'))) {
          console.warn('Lead webhook is not enabled for this form');
        
          return of({ success: false, reason: 'webhook_not_enabled' });
        }
        
       
        console.error('Lead webhook error:', error);
        return throwError(() => new Error(
          error.error?.error || 
          error.error?.message || 
          'Failed to trigger lead webhook'
        ));
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
        
        if (error.status === 400 && 
            (error.error?.error === 'Visit webhook not enabled' || 
             error.error?.message?.includes('not enabled'))) {
          console.warn('Visit webhook is not enabled for this form');
       
          return of({ success: false, reason: 'webhook_not_enabled' });
        }
        
        console.error('Visit webhook error:', error);
        return throwError(() => new Error(
          error.error?.error || 
          error.error?.message || 
          'Failed to trigger visit webhook'
        ));
      })
    );
  }
}