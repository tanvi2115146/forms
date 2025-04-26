import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl ='http://localhost:3000/auth';

  constructor(private http: HttpClient,private cookieService:CookieService) { }

  login(data:any){
    return this.http.post(`${this.baseUrl}/login`,data);
  }

  signup(data:any){
    return this.http.post(`${this.baseUrl}/signup`,data);
  }

  saveToken(token:any){
    this.cookieService.set('authToken',token);
  }

  saveUserInfo(userId: string, username: string) {
    this.cookieService.set('userId', userId);
    
  }
  
  getUserId(): string {
    return this.cookieService.get('userId');
  }
  
  
  getToken(){
    return this.cookieService.get('authToken');
  }

  isLoggedIn():boolean{
    return this.cookieService.check('authToken')
  }

  logout(){
     this.cookieService.delete('authToken');
     this.cookieService.delete('userId');

  }
}
