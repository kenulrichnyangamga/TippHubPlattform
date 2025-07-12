import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Community {
  name: string;
  manager: string | null;
  members: { name: string; status: 'aktiv' | 'gesperrt' }[];


}

@Injectable({
  providedIn: 'root'
})
export class CommunityService {
  private apiUrl = 'http://localhost:8888/api';
  constructor(private http: HttpClient) {}
  private communities: Community[] = [  ];

   getCommunities(): Observable<any[]> {
  return this.http.get<any[]>('http://localhost:8888/api/community');
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
  assignLCBToCommunity(communityId: number, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/communities/${communityId}/lcb`, { userId });
}

getCommunityLCBs(communityId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/communities/${communityId}/lcb`);
}

removeLCBFromCommunity(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/communities/lcb/${userId}`);
}

   createCommunity(community: { name: string, region: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/community`, community);
  }

   deleteCommunity(name: string): Observable<{message: string}> {
  return this.http.delete<{message: string}>(`${this.apiUrl}/communities/${name}`);
}
}
