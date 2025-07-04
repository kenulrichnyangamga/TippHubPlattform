import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-thmcoins-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './thmcoins-management.component.html',
  styleUrls: ['./thmcoins-management.component.css']
})
export class ThmcoinsManagementComponent {
  currentRate = 0.10; // 1 THMCoin = 0.10 €
  newRate = this.currentRate;

  updateRate() {
    if (this.newRate > 0) {
      this.currentRate = this.newRate;
      alert(`Der neue THMCoin-Preis beträgt €${this.currentRate.toFixed(2)}`);
    } else {
      alert('Bitte geben Sie einen gültigen Betrag ein.');
    }
  }
}
