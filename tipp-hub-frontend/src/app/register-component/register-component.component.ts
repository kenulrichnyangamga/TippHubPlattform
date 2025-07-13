import { AuthService } from '../auth.service'; // adapte le chemin si besoin
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
//import { LoginComponent } from './login-component.component';

@Component({
  selector: 'app-register-component',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule], // Ajoute FormsModule et HttpClientModule
  templateUrl: './register-component.component.html',
  styleUrl: './register-component.component.css'
})

export class RegisterComponentComponent {
  status: string = '';
  user = {
  username:'',
  password:'',
  gender: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  birthMonth: '',
  birthDay: '',
  birthYear: '',
  birthPlace: '',
  nationality: '',
  street: '',
  houseNumber: '',
  zip: '',
  city: '',
  role: 'PUS',
  companyName: '',
  companyIndustry: '',
  companyAddress: ''
  };
   isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

 
  geschlecht = '';
  vorname = '';
  nachname = '';
  email = '';
  telefon = '';
  geburtsdatum = '';
  geburtsort = '';
  nationalitaet = '';
  strasse = '';
  hausnummer = '';
  plz = '';
  stadt = '';
  password = '';
  confirmPassword = '';
  passwordMismatch = false;

  // Felder für Unternehmen
  firmaName = '';
  branche = '';
  firmaAdresse = '';

  onStatusChange(value: string) {
    this.status = value;
  }
  onRegister() {
  this.successMessage = '';
  this.errorMessage = '';

   if (!this.user.username || !this.user.email || !this.user.password) {
    this.errorMessage = 'Bitte füllen Sie alle Felder aus';
    return;
  }

    this.isLoading = true;


    this.authService.register({
      username: this.user.username,
      email: this.user.email,
      password: this.user.password,
      role: this.user.role || 'PUS'

    }).subscribe({

      next: () => {
        this.isLoading = false;
        this.successMessage = 'Registrierung erfolgreich! Sie werden zum Login weitergeleitet.';
        setTimeout(() => this.router.navigate(['/login-component']), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Registrierung fehlgeschlagen';
      }
    });
  }
}


