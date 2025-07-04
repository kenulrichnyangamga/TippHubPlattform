import { Injectable } from '@angular/core';

export interface Community {
  name: string;
  manager: string | null;
  members: { name: string; status: 'aktiv' | 'gesperrt' }[];
}

@Injectable({
  providedIn: 'root'
})
export class CommunityService {
  private communities: Community[] = [
    {
      name: 'Berlin Sports',
      manager: null,
      members: [
        { name: 'Hans', status: 'aktiv' },
        { name: 'Julia', status: 'aktiv' }
      ]
    },
    {
      name: 'Hamburg Fußball',
      manager: null,
      members: [
        { name: 'Mark', status: 'aktiv' },
        { name: 'Anna', status: 'aktiv' }
      ]
    }
  ];

  getCommunities(): Community[] {
    return this.communities;
  }

  getUsers(): { name: string; status: 'aktiv' | 'gesperrt'; community: string }[] {
    return this.communities.flatMap(c =>
      c.members.map(m => ({
        name: m.name,
        status: m.status,
        community: c.name
      }))
    );
  }

  setCommunityManager(userName: string, communityName: string): { success: boolean; message: string } {
    const community = this.communities.find(c => c.name === communityName);
    if (!community) {
      return { success: false, message: 'Community nicht gefunden.' };
    }

    const member = community.members.find(m => m.name === userName);
    if (!member) {
      return { success: false, message: 'User ist kein Mitglied dieser Community.' };
    }

    if (member.status === 'gesperrt') {
      return { success: false, message: 'User ist gesperrt und kann kein LCB sein.' };
    }

    community.manager = userName;
    return { success: true, message: 'User wurde erfolgreich als LCB zugeordnet.' };
  }

  toggleUserStatus(userName: string) {
    for (const community of this.communities) {
      const member = community.members.find(m => m.name === userName);
      if (member) {
        member.status = member.status === 'aktiv' ? 'gesperrt' : 'aktiv';
        // Remove from manager if banned
        if (member.status === 'gesperrt' && community.manager === userName) {
          community.manager = null;
        }
        return;
      }
    }
  }

  createCommunity(name: string) {
    if (!this.communities.find(c => c.name === name)) {
      this.communities.push({ name, manager: null, members: [] });
    }
  }

  deleteCommunity(name: string) {
    this.communities = this.communities.filter(c => c.name !== name);
  }
}
