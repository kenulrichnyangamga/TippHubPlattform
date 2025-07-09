import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service'; // ajuste le chemin si nécessaire
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-register-component',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './register-component.component.html',
  styleUrls: ['./register-component.component.css'],
  
})
export class RegisterComponentComponent {

  constructor(private authService: AuthService) {}

  status: string = '';
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
    
    // TODO: envoyer au backend
  }
}
