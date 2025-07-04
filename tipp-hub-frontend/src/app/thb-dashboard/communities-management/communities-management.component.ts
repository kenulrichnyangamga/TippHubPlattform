import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunityService } from '../services/community.service';

@Component({
  selector: 'app-communities-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './communities-management.component.html',
  styleUrls: ['./communities-management.component.css']
})
export class CommunitiesManagementComponent implements OnInit {
  communities: any[] = [];
  selectedCommunity: string = '';
  newCommunityName: string = '';
  newCommunityManager: string = '';
  successMessage: string = '';

  constructor(private communityService: CommunityService) {}

  ngOnInit(): void {
    this.communities = this.communityService.getCommunities();
  }

  deleteCommunity(name: string): void {
    this.communityService.deleteCommunity(name);
    this.ngOnInit();
  }

  createCommunity() {
  const community = {
    name: this.newCommunityName,
    manager: this.newCommunityManager || null,
    members: []
  };

  this.communities.push(community);
}



  getSelectedCommunity() {
    return this.communities.find(c => c.name === this.selectedCommunity);
  }
}
