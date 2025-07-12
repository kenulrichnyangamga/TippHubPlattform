import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThmcoinService, THMCoinTarif } from '../../services/thmcoin.service';



@Component({
  selector: 'app-thmcoins-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './thmcoins-management.component.html',
  styleUrls: ['./thmcoins-management.component.css']
})
export class ThmcoinsManagementComponent implements OnInit {
  tarifs: THMCoinTarif[] = [];

  newTarif: THMCoinTarif = {
    preis_euro: 0,
    preis_coins: 0,
    gueltig_ab: ''
  };

  selectedTarif: THMCoinTarif | null = null;



  constructor(private thmcoinService: ThmcoinService) {}

  ngOnInit(): void {
    this.loadTarifs();
  }

  loadTarifs(): void {
  this.thmcoinService.getAllTarifs().subscribe({
    next: (data) => {
      this.tarifs = data.sort((a, b) =>
        new Date(b.gueltig_ab).getTime() - new Date(a.gueltig_ab).getTime()
      );
    },
    error: (err) => {
      console.error('Fehler beim Laden der Tarife:', err);
    }
  });
}


  createTarif(): void {
    this.thmcoinService.createTHMCoinTarif(this.newTarif).subscribe({
      next: (res) => {
        alert(res);
        this.loadTarifs();
        this.newTarif = { preis_euro: 0, preis_coins: 0, gueltig_ab: '' };
      },
      error: (err) => alert('Fehler beim Erstellen: ' + err.error)
    });
  }

  editTarif(tarif: THMCoinTarif): void {
    console.log('Tarif à éditer:', tarif);
    this.selectedTarif = { ...tarif };
    setTimeout(() => {
    document.querySelector('#edit-form')?.scrollIntoView({ behavior: 'smooth' });
  }, 100);
  }

  deleteTarif(tarifId: number): void {
  if (confirm('Sind Sie sicher, dass Sie diesen Tarif löschen möchten?')) {
    this.thmcoinService.deleteTHMCoinTarif(tarifId).subscribe({
      next: (res) => {
        alert(res);
        this.loadTarifs(); // Recharge la liste après suppression
      },
      error: (err) => alert('Fehler beim Löschen: ' + err.error)
    });
  }
}

  cancelEdit(): void {
    this.selectedTarif = null;
  }

  updateTarif(): void {
    if (!this.selectedTarif) return;

    this.thmcoinService.updateTHMCoinTarif(this.selectedTarif).subscribe({
      next: (res) => {
        alert(res);
        this.loadTarifs();
        this.selectedTarif = null;
      },
      error: (err) => alert('Fehler beim Aktualisieren: ' + err.error)
    });
  }


}
