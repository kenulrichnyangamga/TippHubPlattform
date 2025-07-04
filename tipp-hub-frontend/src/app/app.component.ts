import { Component } from '@angular/core';
import { StartseiteComponent } from './startseite/startseite.component';
import { LoginComponentComponent } from './login-component/login-component.component';
import { RouterModule } from '@angular/router';

import { RegisterComponentComponent } from './register-component/register-component.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [StartseiteComponent, LoginComponentComponent, RouterModule, RegisterComponentComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  
}
