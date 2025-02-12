import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {Router} from '@angular/router';
import {environment} from "../../environments/environments";

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
  accessToken: string;
  refreshToken: string;
  expiryDate: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

  initiateGoogleLogin() {
    // Redirect to your NestJS Google auth endpoint
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  private checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
      const userInfo = this.decodeToken(token);
      this.currentUserSubject.next(userInfo);


    }
  }

  async logout() {
    try {
      // Call backend logout endpoint
      await this.http.post(`${environment.apiUrl}/auth/logout`, {}).toPromise();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clean up local state, even if backend call fails
      localStorage.removeItem('token');
      sessionStorage.clear();
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']);
    }
  }

  private decodeToken(token: string): UserInfo | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Check if token is expired
      const decodedToken = this.decodeToken(token);
      if (!decodedToken) return false;

      // Optional: Check token expiration if you have exp in your JWT
      const expirationDate = this.getTokenExpirationDate(token);
      if (expirationDate && expirationDate < new Date()) {
        localStorage.removeItem('token');
        this.currentUserSubject.next(null);
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  private getTokenExpirationDate(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (decoded && decoded['expiryDate']) {
        return new Date(decoded['expiryDate'] * 1000);
      }
      return null;
    } catch {
      return null;
    }
  }

  handleAuthCallback(token: string) {
    // Store the JWT token
    localStorage.setItem('token', token);

    // Decode and set user info from JWT
    const userInfo = this.decodeToken(token);
    if (userInfo) {
      this.currentUserSubject.next(userInfo);
    } else {
      throw new Error('Invalid token data');
    }
  }
}
