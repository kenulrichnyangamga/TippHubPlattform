import { Component } from '@angular/core';
import {
  trigger,
  style,
  transition,
  animate,
  keyframes
} from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  animations: [
    trigger('bounceIn', [
      transition(':enter', [
        animate(
          '0.8s ease-out',
          keyframes([
            style({ opacity: 0, transform: 'translateY(100px)', offset: 0 }),
            style({ opacity: 1, transform: 'translateY(-15px)', offset: 0.6 }),
            style({ transform: 'translateY(5px)', offset: 0.8 }),
            style({ transform: 'translateY(0)', offset: 1.0 })
          ])
        )
      ])
    ]),
  ],
  templateUrl: './login-component.component.html',
  styleUrls: ['./login-component.component.css']
})
export class LoginComponentComponent {
  public username = '';
  public password = '';
  public email = '';
  public showResetForm = false;
  public resetEmail = '';

  onLogin() {
    console.log('Login-Daten:', {
      username: this.username,
      password: this.password,
      email: this.email
    });
  }

  onForgotPassword() {
    this.showResetForm = true;
    this.resetEmail = this.email;
  }

  cancelReset() {
    this.showResetForm = false;
    this.resetEmail = '';
  }

  submitReset() {
    if (!this.resetEmail || this.resetEmail.trim() === '') {
      alert('Bitte geben Sie Ihre E-Mail-Adresse ein.');
    } else {
      alert(`Ein Link zum Zurücksetzen wurde an ${this.resetEmail} gesendet.`);
      this.cancelReset();
    }
  }
}
