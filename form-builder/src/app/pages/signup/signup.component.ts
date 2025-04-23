import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone:true,
  imports: [CommonModule,FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  firstname='';
  lastname='';
  email='';
  password='';

  constructor(private auth:AuthService,private router:Router){}

  onsignup(){
    this.auth.signup({firstname:this.firstname,lastname:this.lastname,email:this.email,password:this.password})
    
    .subscribe({
      next:()=>{
        alert('signUp succesfully');
        this.router.navigate(['/login']);
      },
      error:(err)=>alert(err.error.message),
    });
   
  }

}
