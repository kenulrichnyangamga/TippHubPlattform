import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunityService } from '../services/community.service';
import { PusService } from 'app/services/pus.service';
interface Community {
  id: number;
  name: string;
  manager?: string; // Optionnel car peut être null
  members?: Array<{
    id: number;
    name: string;
    status: string;
    role: string;
  }>;
}
@Component({
  selector: 'app-communities-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './communities-management.component.html',
  styleUrls: ['./communities-management.component.css']
})


export class CommunitiesManagementComponent implements OnInit {

  
  communities: any[] = [];
 selectedCommunity: Community | null = null;
   communityLCBs: any[] = [];
 users: any[] = [];
  newCommunityName: string = '';
  newCommunityRegion: string = '';
  successMessage: string = '';

  constructor(private communityService: CommunityService, private pusService:PusService) {}

 ngOnInit(): void {
  this.loadCommunities();
}


// Pour assigner un LCB
assignAsLCB(userId: number) {
  if (!this.selectedCommunity?.id || !userId) return;
  
  if (confirm(`Dieses Mitglied wirklich als LCB zuordnen?`)) {
    this.pusService.promoteToLCB(userId, this.selectedCommunity.id).subscribe({
      next: () => {
        this.successMessage = 'Erfolgreich als LCB zugeordnet';
        // Recharger les données de la communauté
        this.loadCommunities();
      },
      error: (err) => {
        this.successMessage = 'Fehler: ' + (err.error?.message || err.message);
      }
    });
  }
}

// Pour afficher les LCB d'une communauté
 loadCommunityLCBs(): void {
    if (!this.selectedCommunity?.id) return;
    this.pusService.getCommunityLCBs(this.selectedCommunity.id).subscribe({
      next: (lcbs) => this.communityLCBs = lcbs,
      error: (err) => console.error('Fehler beim Laden der LCBs:', err)
    });
  }
loadCommunities(): void {
  this.communityService.getCommunities().subscribe({
    next: (data) => {
      this.communities = data;
      this.successMessage = 'Communities erfolgreich aktualisiert';
    },
    error: (err) => {
      console.error('Fehler beim Laden:', err);
      this.successMessage = '❌ Fehler beim Laden der Communities';
    }
  });
}

  deleteCommunity(name: string): void {
  if (!name) return;

  if (confirm(`Sind Sie sicher, dass Sie die Community "${name}" löschen möchten?`)) {
    this.communityService.deleteCommunity(name).subscribe({
      next: () => {
        this.successMessage = `✅ Community "${name}" erfolgreich gelöscht`;
        this.loadCommunities();
      },
      error: (err) => {
        console.error('Löschfehler:', err);
        this.successMessage = `❌ Fehler beim Löschen: ${err.error?.message || err.message}`;
      }
    });
  }
}

  createCommunity() {
  if (!this.newCommunityName) {
    this.successMessage = "❌ Community-Name ist erforderlich";
    return;
  }

  const community = {
    name: this.newCommunityName,
    region: this.newCommunityRegion || ''
  };

  this.communityService.createCommunity(community).subscribe({
    next: () => {
      this.successMessage = '✅ Community erfolgreich erstellt!';
      this.loadCommunities();
      this.newCommunityName = '';
      this.newCommunityRegion = '';
    },
    error: (err) => {
      console.error('Fehlerdetails:', err);
      this.successMessage = err.error?.error || 
        '❌ Serverfehler beim Erstellen der Community';
    }
  });
}

// Ajoutez cette méthode à votre composant
//loadCommunityDetails(communityId: number): void {
 // this.communityService.getCommunityDetails(communityId).subscribe({
   // next: (community) => {
     // this.selectedCommunity = community;
    //},
    //error: (err) => {
     // console.error('Failed to load community details', err);
    //}
  //});
//}
onCommunitySelect(): void {
  if (this.selectedCommunity) {
    console.log('Communauté sélectionnée :', this.selectedCommunity);
    //this.loadCommunityDetails(this.selectedCommunity.id);
  }
}
  getSelectedCommunity() {
    const community = this.communities.find(c => c.name === this.selectedCommunity?.name);
    if (community) this.loadCommunityLCBs(); // Charge les LCBs quand une communauté est sélectionnée
    return community;
  }
}
