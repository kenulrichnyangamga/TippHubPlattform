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

  constructor(private communityService: CommunityService, private pusService: PusService) {}

  ngOnInit() {
    this.users = this.communityService.getUsers();
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
  toggleUserStatus(user: any) {
    this.communityService.toggleUserStatus(user.name);
    this.ngOnInit(); // Refresh
  }

   loadPusList(): void {
    this.pusService.getPusList().subscribe({
      next: (data) => this.users = data,
      error: (err) => this.successMessage = 'Fehler beim Laden der PUS-Liste'
    });
  }

   managePus(pusId: number, action:  'sperren' | 'freigeben' | 'lcb'): void {
    if (!confirm(`Sind Sie sicher, dass Sie diese Aktion (${action}) durchführen möchten?`)) {
      return;
    }

    this.pusService.updatePusStatus(pusId, action).subscribe({
      next: () => {
        this.successMessage = `Aktion ${action} erfolgreich durchgeführt`;
        this.loadPusList();
      },
      error: (err) => {
        this.successMessage = `Fehler bei ${action}: ${err.error?.message || err.message}`;
      }
    });
  }
  loadUsers(): void {
  this.pusService.getPusList().subscribe({
    next: (users) => {
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
