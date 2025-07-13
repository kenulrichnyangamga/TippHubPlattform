import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-kwa-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './kwa-dashboard.component.html',
  styleUrls: ['./kwa-dashboard.component.css']
})
export class KwaDashboardComponent implements OnInit {
  activeTab: string = 'ankuendigung'; // utilisé pour les onglets

  // Ankündigungen
  announcementForm: FormGroup;
  announcements: any[] = [];
  allCommunities: string[] = ['Frankfurt', 'Berlin', 'München'];
  selectedCommunities: string[] = [];

  // Gutschrift
  creditForm: FormGroup;
  allPUS: string[] = ['alex22', 'sara45', 'tom23'];
  gutschriften: { recipient: string; amount: number; date: string }[] = [];

  // Abrechnung
  abrechnungen: {
    monat: string;
    gesamt: number;
    pdf: string;
    details: string;
    totalEur: number;
  }[] = [];

  constructor(private fb: FormBuilder) {
    this.announcementForm = this.fb.group({
      title: [''],
      description: [''],
      link: ['']
    });

    this.creditForm = this.fb.group({
      recipient: [''],
      amount: ['']
    });
  }

  ngOnInit(): void {}

  // 📝 Neue Ankündigung speichern
  submitAnnouncement() {
    const newAnnouncement = {
      ...this.announcementForm.value,
      communities: [...this.selectedCommunities]
    };
    this.announcements.push(newAnnouncement);
    this.announcementForm.reset();
    this.selectedCommunities = [];
    alert('✅ Ankündigung erfolgreich erstellt!');
  }

  toggleCommunity(region: string) {
    const idx = this.selectedCommunities.indexOf(region);
    if (idx > -1) this.selectedCommunities.splice(idx, 1);
    else this.selectedCommunities.push(region);
  }

  // 💰 THMCoins gutschreiben
  gutschreiben() {
    const credit = this.creditForm.value;
    const eintrag = {
      recipient: credit.recipient,
      amount: credit.amount,
      date: new Date().toLocaleDateString()
    };
    this.gutschriften.push(eintrag);
    this.creditForm.reset();
    alert(`💸 ${credit.amount} THMCoins gutgeschrieben an ${credit.recipient}`);
  }

  // 📄 Beispielhafte Monatsabrechnung
  generateAbrechnung() {
    this.abrechnungen.push({
      monat: 'Juli 2025',
      gesamt: 120,
      pdf: 'link-zur-rechnung.pdf',
      totalEur: 36,
      details: '120 Coins zu 0.30 € = 36 €'
    });
  }
}
