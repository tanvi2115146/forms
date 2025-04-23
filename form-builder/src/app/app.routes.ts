import { Routes } from '@angular/router';
import { SignupComponent } from './pages/signup/signup.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FormBuilderComponent } from './pages/form-builder/form-builder.component';
import { AuthGuard } from './guard/auth.guard';

export const routes: Routes = [
    {path:'signup', component:SignupComponent},
    {path:'login', component:LoginComponent},
    {path:'dashboard', component:DashboardComponent, canActivate:[AuthGuard] },
    {path:'form',component:FormBuilderComponent, canActivate:[AuthGuard] },
    {path:'',redirectTo:'signup',pathMatch:'full'}
];
