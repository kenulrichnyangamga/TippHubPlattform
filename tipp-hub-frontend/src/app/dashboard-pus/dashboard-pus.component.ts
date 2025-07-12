import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommunityService } from '../thb-dashboard/services/community.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
  username = 'alex22'; // À remplacer par un login réel
  events: any[] = [];
  demandesDePari: any[] = [];

  hasCommunity = false;
  communityRequestSent = false;
  availableCommunities: string[] = [];

  betForm: FormGroup;
  joinForm: FormGroup;

  showJoinForm = false;

  mesWettenErstellt: any[] = [];
  mesWettenAkzeptiert: any[] = [];

  constructor(
    private fb: FormBuilder,
    private communityService: CommunityService
  ) {
    this.betForm = this.fb.group({
      match: [''],
      montant: [''],
      cote: ['']
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
    this.loadDemandesPari();
    this.checkUserCommunity();
  }

  checkUserCommunity() {
    const users = this.communityService.getUsers();
    const user = users.find((u: any) => u.name === this.username);
    this.hasCommunity = !!user;

    if (!user) {
      //this.availableCommunities = this.communityService.getCommunities().map((c: any) => c.name);
    }
  }

  requestJoinCommunity() {
    this.showJoinForm = true;
  }

  envoyerDemande() {
    const infos = this.joinForm.value;
    this.communityRequestSent = true;
    this.showJoinForm = false;
    console.log(`${this.username} möchte einer Community beitreten. Infos:`, infos);
    alert('📩 Ihre Anfrage zur Community wurde erfolgreich gesendet.');
    this.joinForm.reset();
  }

  loadEvenements() {
    this.events = [
      { title: 'Bundesliga: Leipzig vs Frankfurt', date: null },
      { title: 'Champions League: PSG vs Barça', date: '22. Juli 2025' }
    ];
  }

  loadDemandesPari() {
    this.demandesDePari = [
      { username: 'alex22', match: 'PSG vs Barça', montant: 20, cote: '1:2' },
      { username: 'marie34', match: 'Bayern vs Dortmund', montant: 15, cote: '1:1.5' }
    ];
  }

  acheterTHMCoins() {
    alert('Redirection vers la page d\'achat de THMCoins.');
  }

  inscrire(event: any) {
    alert(`Inscription à l'événement : ${event.title}`);
  }

  creerDemandePari() {
    const demande = this.betForm.value;
    demande.username = this.username;
    this.demandesDePari.push(demande);
    this.mesWettenErstellt.push(demande);
    this.betForm.reset();
  }

  accepterPari(demande: any) {
    this.mesWettenAkzeptiert.push(demande);
    alert(`Sie haben die Wette über ${demande.match} akzeptiert.`);
  }

  negocierPari(demande: any) {
    alert(`Vous souhaitez négocier le pari sur : ${demande.match}`);
  }
}
