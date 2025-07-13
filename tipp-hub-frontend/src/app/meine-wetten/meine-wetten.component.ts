import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WettenService } from '../services/wetten.service'; 

@Component({
  selector: 'app-meine-wetten',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './meine-wetten.component.html',
  styleUrls: ['./meine-wetten.component.css']
})
export class MeineWettenComponent implements OnInit {

  username = 'alex22';
  mesWetten: any[] = [];
  wettenAkzeptiert: any[] = [];

  selectedWette: any = null;

  constructor(private wettenService: WettenService) {} 

  ngOnInit(): void {
    this.wettenService.wetten$.subscribe((list) => {
      
      this.mesWetten = list.filter(w => w.username === this.username);
    });

    // Exemple fixe pour "acceptées"
    this.wettenAkzeptiert = [
      { username: 'paul99', match: 'Real vs Milan', montant: 10, cote: '1:1.7' },
      { username: 'tom23', match: 'Marseille vs Lille', montant: 8, cote: '1:1.8' }
    ];
  }

  anzeigenDetails(wette: any): void {
    this.selectedWette = wette;
    const modal = document.getElementById('detailsModal');
    if (modal) {
      const modalBootstrap = new (window as any).bootstrap.Modal(modal);
      modalBootstrap.show();
    }
  }

  loeschenWette(index: number): void {
    const confirmation = confirm('Möchten Sie diese Wette wirklich löschen?');
    if (confirmation) {
    
      this.wettenService.removeWette(index);
    }
  }
  zurueckziehen(wette: any): void {
  const index = this.wettenService.findIndex(wette);
  if (index !== -1) {
    this.wettenService.zurueckziehen(index);
  }
}

}
