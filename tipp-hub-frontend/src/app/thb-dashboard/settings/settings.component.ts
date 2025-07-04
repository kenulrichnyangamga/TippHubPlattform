import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  username = 'adminTHB';
  email = 'thb@example.com';
  language = 'de';
  newPassword = '';
  confirmPassword = '';
  profileImageUrl = 'https://via.placeholder.com/100'; // Par défaut

  saveProfile() {
    alert('Profil gespeichert!');
    console.log('Username:', this.username);
    console.log('Sprache:', this.language);
  }

  changePassword() {
    if (this.newPassword.length < 6) {
      alert('Das Passwort muss mindestens 6 Zeichen haben.');
    } else if (this.newPassword !== this.confirmPassword) {
      alert('Die Passwörter stimmen nicht überein.');
    } else {
      alert('Passwort erfolgreich geändert!');
      this.newPassword = '';
      this.confirmPassword = '';
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}
