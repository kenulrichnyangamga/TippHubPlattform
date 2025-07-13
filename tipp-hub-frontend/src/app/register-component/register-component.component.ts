import { AuthService } from '../auth.service'; // adapte le chemin si besoin
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-component',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule], // Ajoute FormsModule et HttpClientModule
  templateUrl: './register-component.component.html',
  styleUrl: './register-component.component.css'
})

export class RegisterComponentComponent implements OnInit {
  status: string = '';
  user = {
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
  companyAddress: '',
  password: ''
  };

  constructor(private authService: AuthService) {}

 
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

    if (this.password !== this.confirmPassword) {
  this.passwordMismatch = true;
  return;
}
this.passwordMismatch = false;

     const daten = {
      geschlecht: this.geschlecht,
      vorname: this.vorname,
      nachname: this.nachname,
      email: this.email,
      telefon: this.telefon,
      geburtsdatum: this.geburtsdatum,
      geburtsort: this.geburtsort,
      nationalitaet: this.nationalitaet,
      adresse: {
        strasse: this.strasse,
        hausnummer: this.hausnummer,
        plz: this.plz,
        stadt: this.stadt
      },
      status: this.status,
      password: this.password,
      firma: this.status === 'KWA' ? {
        name: this.firmaName,
        branche: this.branche,
        adresse: this.firmaAdresse
      } : null
    };

      console.log('Registrierungsdaten:', daten);

    const user = {
      username: `${this.vorname}.${this.nachname}`,
      email: this.email,
      password: this.password,
      role: this.status
    };

    this.authService.register(user).subscribe({
      next: () => this.status = '✅ Enregistrement réussi !',
      error: err => this.status = '❌ Erreur: ' + err.error
    });
  }
  days: number[] = [];
months: number[] = [];
years: number[] = [];

ngOnInit() {
  this.days = Array.from({ length: 31 }, (_, i) => i + 1);
  this.months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  this.years = Array.from({ length: 100 }, (_, i) => currentYear - i);
}

}

