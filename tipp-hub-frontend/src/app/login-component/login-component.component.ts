import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
 
@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login-component.component.html',
  styleUrls: ['./login-component.component.css']
})
export class LoginComponentComponent {
   credentials = {
    email: '', // Peut être email ou username
    password: ''
  };
  // isLoading = false;
  errorMessage = '';
  public username = '';
  public password = '';
  public email = '';
  public showResetForm = false;
  public resetEmail = '';

  constructor(private router: Router, private authService: AuthService) {}

  onLogin() {
    console.log('✅ onLogin() déclenché', this.credentials.email, this.credentials.password);
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Bitte geben Sie E-Mail und Passwort ein.';
      return;
    }

   // this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials.email, this.credentials.password).subscribe({
      next: (res) => {
        //this.isLoading = false;
         if (res.role === 'THB') {
          console.log('Login thb success', res);
        this.router.navigate(['/thb-dashboard']);
      } 
      else if (res.role === 'PUS') {
        console.log('Login pus success', res);
        this.router.navigate(['/dashboard-pus']);
      }
      else if (res.role === 'KWA') {
        console.log('Login kwa success', res);
        this.router.navigate(['/dashboardkwa']);
      }

      },
      error: (err) => {
        //this.isLoading = false;
         console.error('Login failed', err);
        this.errorMessage = 'Login fehlgeschlagen: Falsche Anmeldedaten';
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
