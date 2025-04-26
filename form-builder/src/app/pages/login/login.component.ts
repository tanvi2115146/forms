import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone:true,
  imports: [CommonModule,FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})


export class LoginComponent {
    email='';
    password='';
    

    constructor(private auth:AuthService,private router:Router){}

    onLogin() {
      const user = {
        email: this.email,
        password: this.password
      };
    
      this.auth.login(user).subscribe({
        next: (res: any) => {
          if (res.message === 'Login successful') {
            this.auth.saveToken(res.token);
            this.auth.saveUserInfo(res.userId, res.username);
            console.log('token',res.token,"userId",res.userId);
            this.router.navigate(['/dashboard']);
          } else {
            alert('Login failed: ' + res.message);
          }
        },
        error: (err) => {
          alert('Login failed: ' + err.error.message);
        }
      });
    }
    

}
