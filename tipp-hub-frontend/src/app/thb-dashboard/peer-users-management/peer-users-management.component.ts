import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CommunityService } from '../services/community.service';

@Component({
  selector: 'app-peer-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './peer-users-management.component.html',
  styleUrls: ['./peer-users-management.component.css']
})
export class PeerUsersManagementComponent implements OnInit {
  users: any[] = [];
  communities: any[] = [];
  selectedUser: any = null;
  selectedCommunity: string = '';
  search: string = '';
  successMessage: string = '';

  constructor(private communityService: CommunityService) {}

  ngOnInit() {
    this.users = this.communityService.getUsers();
    this.communities = this.communityService.getCommunities();
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

  assignAsLCB() {
    if (!this.selectedUser || !this.selectedCommunity) return;

    const result = this.communityService.setCommunityManager(this.selectedUser.name, this.selectedCommunity);
    if (result.success) {
      this.successMessage = result.message;
      setTimeout(() => (this.successMessage = ''), 3000);
    } else {
      alert(result.message);
    }
  }

  toggleUserStatus(user: any) {
    this.communityService.toggleUserStatus(user.name);
    this.ngOnInit(); // Refresh
  }
}
