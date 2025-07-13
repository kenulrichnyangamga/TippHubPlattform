import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = 'http://localhost:8888/api';
  private loggedIn = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
  return this.http.post<any>(`${this.authUrl}/login`, { email, password }).pipe(
    tap(res => {
      console.log('✅ Login response:', res);
      localStorage.setItem('currentUser', JSON.stringify(res));
      this.loggedIn.next(true);
    })
  );
}


  register(userData: any) {
    return this.http.post(`${this.authUrl}/register`, {
      email: userData.email,
      password: userData.password,
      username: userData.username, 
      role: userData.role || 'PUS' },{
       responseType: 'text'}
    );

  }

  logout() {
    localStorage.removeItem('currentUser');
    this.loggedIn.next(false);
    this.router.navigate(['/login-component']);
  }

  isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  }
}