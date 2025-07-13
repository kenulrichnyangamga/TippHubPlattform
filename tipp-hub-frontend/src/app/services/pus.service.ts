import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PusService {
  private apiUrl = 'http://localhost:8888/api';

  constructor(private http: HttpClient) {}

  promoteToLCB(userId: number, communityId: number): Observable<any> {
    return this.http.post(
        `${this.apiUrl}/communities/${communityId}/assign-lcb/${userId}`,
        {}, // Body vide car tout est dans l'URL
        { headers: new HttpHeaders({'Content-Type': 'application/json'}) }
    );
}
toggleUserStatus(userId: number, action: 'sperren'|'freigeben'): Observable<any> {
  const newStatus = action === 'sperren' ? 'gesperrt' : 'aktiv';
  
  return this.http.patch(`${this.apiUrl}/pus/${userId}/status`, { 
    status: newStatus 
  }, { responseType: 'text' });
}
// pus.service.ts
getCommunityLCBs(communityId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/communities/${communityId}/lcb`);
}
  getPusList(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pus`);
  }

  
}