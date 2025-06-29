import { Component } from '@angular/core';
import { StartseiteComponent } from './startseite/startseite.component';
import { LoginComponentComponent } from './login-component/login-component.component';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [StartseiteComponent, LoginComponentComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  
}
