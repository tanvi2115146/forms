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

    onLogin(){
      this.auth.login({email:this.email,password:this.password})
      .subscribe({
        next:(res:any)=>{
          console.log('Login Response:', res);
          this.auth.saveToken(res.token);
          this.router.navigate(['/dashboard']);
        },
        error:(err)=>alert(err.error.message),
      });
    }

}
