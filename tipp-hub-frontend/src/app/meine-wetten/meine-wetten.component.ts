import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-meine-wetten',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './meine-wetten.component.html',
  styleUrls: ['./meine-wetten.component.css']
})
export class MeineWettenComponent implements OnInit {

  username = 'alex22';

  mesWetten = [
    { match: 'PSG vs Barça', montant: 20, cote: '1:2', acceptePar: 'marie34' },
    { match: 'Bayern vs Dortmund', montant: 15, cote: '1:1.5', acceptePar: null }
  ];

  wettenAkzeptiert = [
    { username: 'paul99', match: 'Real vs Milan', montant: 10, cote: '1:1.7' },
    { username: 'tom23', match: 'Marseille vs Lille', montant: 8, cote: '1:1.8' }
  ];

  ngOnInit(): void {}
}
