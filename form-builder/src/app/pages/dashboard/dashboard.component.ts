import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router ,RouterModule} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormService } from '../../services/form.service';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  forms: any[] = [];

  constructor(
    public router: Router,
    private auth: AuthService,
    private formService: FormService,
    
  ) {}

  ngOnInit() {
    const userId = this.auth.getUserId();
    if (userId) {
      this.loadForms(userId);
    }
  }

  loadForms(userId: string) {
    this.formService.getFormByUserId(userId).subscribe(
      (res) => {
        console.log('response:',res);
        this.forms = Array.isArray(res) ? res:[];
      },
      (err) => console.error(err)
    );
  }

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  createNewForm() {
    const userId = this.auth.getUserId();
    if (userId) {
      this.formService.createForm(userId).subscribe({
        next: (res: any) => {
          const formId = res.formId;
          this.router.navigate(['/build', formId]);
        },
        error: (err) => console.error('Error creating form:', err)
      });
    }
  }

  editForm(formId: string) {
    this.router.navigate(['/build', formId]);
  }



}
