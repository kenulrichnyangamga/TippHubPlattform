import { Routes } from '@angular/router';
import { StartseiteComponent } from './startseite/startseite.component';
import { LoginComponentComponent } from './login-component/login-component.component';
import { RegisterComponentComponent } from './register-component/register-component.component';

export const routes: Routes = [
    { path: '', redirectTo: 'startseite', pathMatch: 'full' },
    {path : "startseite", component : StartseiteComponent},
    {path: "login-component", component : LoginComponentComponent},
    { path: 'register-component', component: RegisterComponentComponent }
];

