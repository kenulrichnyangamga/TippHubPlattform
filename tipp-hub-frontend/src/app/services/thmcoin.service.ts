// src/app/services/thmcoin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface THMCoinTarif {
  id?:number;
  preis_euro: number;
  preis_coins: number;
  gueltig_ab: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThmcoinService {
  private baseUrl = 'http://localhost:8888/api/thmcoins'; // À adapter selon ton backend

  constructor(private http: HttpClient) {}

  // thmcoin.service.ts
 deleteTHMCoinTarif(id: number): Observable<string> {
  return this.http.delete(`${this.baseUrl}/${id}`, {
    responseType: 'text' // Explizit Textantwort erwarten
  });
}

  getAllTarifs(): Observable<THMCoinTarif[]> {
    return this.http.get<THMCoinTarif[]>(`${this.baseUrl}`);
  }

  createTHMCoinTarif(tarif: THMCoinTarif): Observable<any> {
    return this.http.post(`${this.baseUrl}`, tarif, { responseType: 'text' });
  }

  updateTHMCoinTarif(tarif: THMCoinTarif): Observable<any> {
    return this.http.put(`${this.baseUrl}`, tarif, { responseType: 'text' });
  }
}
