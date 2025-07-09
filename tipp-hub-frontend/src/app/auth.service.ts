import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8888/api';
  private apiUrl = 'http://localhost:8888/api';

  constructor(private http: HttpClient) {}

  register(user: any) {
    return this.http.post(`${this.baseUrl}/register`, user);
  }

  login(identifier: string, password: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/login`, {
    username: identifier,
    password: password
  });
}

  getUsers() {
    return this.http.get(`${this.baseUrl}/users`);
  }
}
