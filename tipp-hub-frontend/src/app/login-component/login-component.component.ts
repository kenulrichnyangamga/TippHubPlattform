import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login-component.component.html',
  styleUrls: ['./login-component.component.css']
})
export class LoginComponentComponent {
  public username = '';
  public password = '';
  public email = '';
  public showResetForm = false;
  public resetEmail = '';

  constructor(private router: Router) {}

  onLogin() {
    // Rediriger directement vers le dashboard du THB sans vérification
    this.router.navigate(['/thb-dashboard']);
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
