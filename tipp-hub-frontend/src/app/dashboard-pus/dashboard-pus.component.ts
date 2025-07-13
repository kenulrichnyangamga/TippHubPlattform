import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommunityService } from '../thb-dashboard/services/community.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { WettenService, Wette } from '../services/wetten.service';

@Component({
  selector: 'app-dashboard-pus',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    ReactiveFormsModule,
  ],
  templateUrl: './dashboard-pus.component.html',
  styleUrls: ['./dashboard-pus.component.css']
})
export class DashboardPusComponent implements OnInit {

  soldeTHMCoins = 120;
  username = 'alex22';

  events: any[] = [];
  demandesDePari: Wette[] = [];

  hasCommunity = false;
  communityRequestSent = false;

  betForm: FormGroup;
  joinForm: FormGroup;

  showJoinForm = false;
  showBuyForm = false;

  buyOptions = [
    { coins: 1, euros: 0.5 },
    { coins: 10, euros: 4 },
    { coins: 50, euros: 18 },
    { coins: 100, euros: 30 }
  ];

  mesWettenErstellt: Wette[] = [];
  mesWettenAkzeptiert: Wette[] = [];
  isLCB = false;

  constructor(
    private fb: FormBuilder,
    private communityService: CommunityService,
    private http: HttpClient,
    private wettenService: WettenService
  ) {
    this.betForm = this.fb.group({
      match: [''],
      montant: [''],
      cote: [''],
      categorie: ['']
    });

    this.joinForm = this.fb.group({
      vorname: [''],
      nachname: [''],
      strasse: [''],
      hausnummer: [''],
      plz: [''],
      stadt: ['']
    });
  }

  ngOnInit(): void {
    this.loadEvenements();
    this.checkUserCommunity();

    this.wettenService.wetten$.subscribe((list) => {
      this.demandesDePari = list;
      this.mesWettenErstellt = list.filter(w => w.username === this.username);
      this.mesWettenAkzeptiert = list.filter(
        w => w.acceptePar === this.username && w.status === 'akzeptiert'
      );
      this.isLCB = this.communityService.isUserLCB(this.username);
    });
  }

  checkUserCommunity() {
    const users = this.communityService.getUsers();
    const user = users.find((u: any) => u.name === this.username);
    this.hasCommunity = !!user;
  }

  requestJoinCommunity() {
    this.showJoinForm = true;
  }

  envoyerDemande() {
    const infos = this.joinForm.value;
    this.communityRequestSent = true;
    this.showJoinForm = false;
    alert('📩 Ihre Anfrage zur Community wurde erfolgreich gesendet.');
    this.joinForm.reset();
  }

  loadEvenements() {
    this.events = [
      { title: 'Bundesliga: Leipzig vs Frankfurt' },
      { title: 'Champions League: PSG vs Barça' }
    ];
  }

  acheterTHMCoins() {
    this.showBuyForm = !this.showBuyForm;
  }

  acheterOption(option: any) {
    const payload = {
      username: this.username,
      coins: option.coins,
      euros: option.euros
    };

    this.http.post<any>('/api/coins/acheter', payload).subscribe({
      next: (response) => {
        this.soldeTHMCoins = response.nouveauSolde;
        alert(`✅ Vous avez acheté ${option.coins} THMCoins pour ${option.euros} €.`);
        this.showBuyForm = false;
      },
      error: () => {
        alert('❌ Eine Fehler ist aufgetreten.');
      }
    });
  }

  inscrire(event: any) {
    alert(`Inscription à l'événement : ${event.title}`);
  }

  creerDemandePari() {
    const demande: Wette = {
      ...this.betForm.value,
      username: this.username
    };
    this.wettenService.addWette(demande);
    this.betForm.reset();
  }

  accepterPari(wette: Wette) {
    const index = this.wettenService.findIndex(wette);
    this.wettenService.updateStatus(index, 'akzeptiert', this.username);
  }

  negocierPari(wette: Wette) {
    const index = this.wettenService.findIndex(wette);
    this.wettenService.updateStatus(index, 'verhandlung', this.username);
  }

  istMeineWette(wette: Wette): boolean {
    return wette.username === this.username;
  }

  istStatus(wette: Wette, status: string): boolean {
    return wette.status === status && wette.acceptePar === this.username;
  }
}

//export { DashboardPusComponent };
