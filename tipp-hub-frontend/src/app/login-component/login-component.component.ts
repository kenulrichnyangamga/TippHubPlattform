import { Component } from '@angular/core';
import {
  trigger,
  style,
  transition,
  animate,
  keyframes
} from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

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

  constructor(private router: Router, private authService: AuthService) {}

  onLogin() {
    const identifier = this.username || this.email;

    if (!identifier || !this.password) {
      alert('❌ Bitte geben Sie Benutzername/E-Mail und Passwort ein.');
      return;
    }

    this.authService.login(identifier, this.password).subscribe({
      next: (res: any) => {
        alert(`✅ Willkommen ${res.username}`);
        this.router.navigate(['/thb-dashboard']);
      },
      error: (err: any) => {
        alert('❌ Login fehlgeschlagen: Benutzername oder Passwort falsch');
      }
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
