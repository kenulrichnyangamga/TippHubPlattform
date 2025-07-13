import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lcb-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './lcb-dashboard.component.html',
  styleUrls: ['./lcb-dashboard.component.css']
})
export class LcbDashboardComponent implements OnInit {
  username = 'alex22';

  activeTab: string = 'anfragen';

  allPUS = [
    { name: 'paul99', region: 'Frankfurt' },
    { name: 'emma12', region: 'Berlin' },
    { name: 'tom23', region: 'Frankfurt' }
  ];

  communityRegion = 'Frankfurt';
  pusInRegion: { name: string; region: string }[] = [];
  localCommunity: string[] = ['tom23'];

  joinRequests: any[] = [
    { name: 'sara45', region: 'Frankfurt', details: 'Details über sara', rejectionReason: '', showRejectBox: false },
    { name: 'juli89', region: 'Frankfurt', details: 'Details über juli', rejectionReason: '', showRejectBox: false }
  ];

  rejectionReasons = [
    'Region passt nicht',
    'Unvollständiges Profil',
    'Verstoß gegen Regeln',
    'Andere'
  ];

  conflits: { between: [string, string]; reason: string }[] = [
    { between: ['paul99', 'emma12'], reason: 'Unstimmigkeit bei Wettquote' },
    { between: ['tom23', 'paul99'], reason: 'Unbestätigte Wette' }
  ];

  gutschrift: number = 50;

  eventForm: FormGroup;
  events: { title: string; date: string }[] = [
    { title: 'LCB Cup', date: '2025-08-01' }
  ];

  constructor(private fb: FormBuilder) {
    this.eventForm = this.fb.group({
      title: [''],
      date: ['']
    });
  }

  ngOnInit(): void {
    this.pusInRegion = this.allPUS.filter(p => p.region === this.communityRegion);
  }

  acceptPUS(request: any) {
    this.localCommunity.push(request.name);
    this.joinRequests = this.joinRequests.filter(r => r !== request);
    alert(`✅ ${request.name} wurde in die Community aufgenommen.`);
  }

  toggleReject(request: any) {
    request.showRejectBox = !request.showRejectBox;
  }

  rejectPUS(request: any) {
    request.status = 'rejected';
    const reason = request.rejectionReason || 'Kein Grund angegeben';
    alert(`❌ ${request.name} wurde mit dem Grund "${reason}" abgelehnt.`);
    this.joinRequests = this.joinRequests.filter(r => r !== request);
  }

  removePUS(name: string) {
    this.localCommunity = this.localCommunity.filter(n => n !== name);
    alert(`🚫 ${name} wurde aus der Community entfernt.`);
  }

  createEvent(): void {
    const event = this.eventForm.value;
    this.events.push(event);
    alert(`📢 Event "${event.title}" hinzugefügt!`);
    this.eventForm.reset();
  }

  addToCommunity(name: string) {
    if (!this.localCommunity.includes(name)) {
      this.localCommunity.push(name);
    }
  }
  aktuelleGutschrift: number = 50;
gutschriftVerlauf: { date: string, amount: number }[] = [];

aktualisierenGutschrift() {
  const heute = new Date().toISOString().split('T')[0];
  const betrag = 50; // montant fixe ou calculable
  this.aktuelleGutschrift += betrag;

  this.gutschriftVerlauf.push({ date: heute, amount: betrag });
  alert(`💸 Sie haben ${betrag} THMCoins vom THB erhalten (${heute})`);
}

}
