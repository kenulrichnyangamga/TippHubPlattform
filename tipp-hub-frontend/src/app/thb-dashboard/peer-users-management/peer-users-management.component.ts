import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CommunityService } from '../services/community.service';
import { PusService } from '../../services/pus.service';

@Component({
  selector: 'app-peer-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './peer-users-management.component.html',
  styleUrls: ['./peer-users-management.component.css']
})
export class PeerUsersManagementComponent implements OnInit {
  // Ajoutez ces propriétés à votre composant
errorMessage: string = '';
searchTerm: string = '';
selectedCommunityId: number | null = null;
filteredUsers: any[] = [];
selectedCommunityForAssignment: number | null = null;
  users: any[] = [];
  communities: any[] = [];
  selectedUser: any = null;
  selectedCommunity: string = '';
  search: string = '';
  successMessage: string = '';
  isLoading: boolean = true;
  

  constructor(private communityService: CommunityService, private pusService: PusService) {}

  ngOnInit() {
    this.loadPusList();
    //this.communities = this.communityService.getCommunities();
  }

  getFilteredUsers(): any[] {
    let result = this.users;

    if (this.selectedCommunity) {
      result = result.filter(user => user.community === this.selectedCommunity);
    }

    if (this.search.trim()) {
      result = result.filter(user =>
        user.name.toLowerCase().includes(this.search.toLowerCase())
      );
    }

    return result;
  }

  assignAsLCB(user: any): void {
  if (!user || !this.selectedCommunityId) return;
  
  this.pusService.promoteToLCB(user.id, this.selectedCommunityId).subscribe({
    next: () => {
      this.successMessage = `${user.username} ist jetzt LCB`;
      this.loadUsers();
    },
    error: (err) => this.errorMessage = 'Fehler: ' + err.message
  });
}
toggleUserStatus(user: { id: number, status: 'aktiv' | 'gesperrt' }): void {
  // Debug : vérifiez que user et user.user_id existent
  console.log('Current user:', user); // <-- À vérifier dans la console navigateur (F12)

  if (!user?.id || user?.status === undefined) {
    this.errorMessage = 'Benutzerdaten sind unvollständig!';
    return;
  }

  const action = user.status === 'aktiv' ? 'sperren' : 'freigeben';
  this.pusService.toggleUserStatus(user.id, action).subscribe({
    next: () => {
      user.status = action === 'freigeben' ? 'aktiv' : 'gesperrt';
      this.successMessage = `Benutzer wurde ${action === 'freigeben' ? 'freigegeben' : 'gesperrt'}.`;
    },
    error: (err) => {
      this.errorMessage = `Fehler: ${err.statusText || 'Unbekannter Fehler'}`;
      console.error('API Error:', err); // <-- Détails dans la console
    }
  });
}

   // Méthodes d'aide
  private showSuccess(message: string): void {
    // Implémentez votre logique d'affichage de succès
    console.log('Succès:', message);
  }

  private showError(message: string): void {
    // Implémentez votre logique d'affichage d'erreur
    console.error('Erreur:', message);
  }

  


loadPusList(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.pusService.getPusList().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Fehler beim Laden der PUS-Liste';
        this.isLoading = false;
        console.error('Erreur:', err);
      }
    });
  }
   managePus(pusId: number, action:  'sperren' | 'freigeben' | 'lcb'): void {
    if (!confirm(`Sind Sie sicher, dass Sie diese Aktion (${action}) durchführen möchten?`)) {
      return;
    }
    if (action === 'lcb') {
    // appeler la fonction spécifique pour gérer LCB
    this.assignAsLCB(pusId);
    return;
  }


    this.pusService.toggleUserStatus(pusId, action).subscribe({
      next: () => {
        this.successMessage = `Aktion ${action} erfolgreich durchgeführt`;
        this.loadUsers();
      },
      error: (err) => {
        this.successMessage = `Fehler bei ${action}: ${err.error?.message || err.message}`;
      }
    });
  }
  loadUsers(): void {
  this.pusService.getPusList().subscribe({
    next: (users) => {
       console.log('✅ Données reçues de l’API:', users);
      this.users = users;
      this.filteredUsers = this.getFilteredUsers();
    },
    error: (err) => this.errorMessage = 'Fehler beim Laden der Benutzer'
  });
}
confirmLCBAssignment(): void {
  if (!this.selectedUser || !this.selectedCommunityForAssignment) return;
  this.assignAsLCB(this.selectedUser);
}
}
