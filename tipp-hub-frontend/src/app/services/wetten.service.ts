import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Wette = {
  id?: string;
  match: string;
  montant: number;
  cote: string;
  categorie: string;
  username: string;
  status?: 'offen' | 'akzeptiert' | 'verhandlung';
  acceptePar?: string | null;
};

@Injectable({ providedIn: 'root' })
export class WettenService {
  private wetten: Wette[] = [];

  private wettenSubject = new BehaviorSubject<Wette[]>([]);
  wetten$ = this.wettenSubject.asObservable();

  getWetten(): Wette[] {
    return [...this.wetten];
  }

  addWette(wette: Wette): void {
    wette.status = 'offen';
    wette.acceptePar = null;
    wette.id = crypto.randomUUID();
    this.wetten.push(wette);
    this.wettenSubject.next(this.getWetten());
  }

  removeWette(index: number): void {
    this.wetten.splice(index, 1);
    this.wettenSubject.next(this.getWetten());
  }

  updateStatus(index: number, status: 'akzeptiert' | 'verhandlung', byUser: string): void {
    const wette = this.wetten[index];
    if (wette) {
      wette.status = status;
      wette.acceptePar = byUser;
      this.wettenSubject.next(this.getWetten());
    }
  }

  zurueckziehen(index: number): void {
    const wette = this.wetten[index];
    if (wette) {
      wette.status = 'offen';
      wette.acceptePar = null;
      this.wettenSubject.next(this.getWetten());
    }
  }

  findIndex(wette: Wette): number {
  return this.wetten.findIndex(w => w.id === wette.id);
}
}

