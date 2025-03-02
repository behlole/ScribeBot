// src/app/components/login/login.component.ts
import {Component} from '@angular/core';
import {AuthService} from "../../services/AuthService.service";
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-page">
      <div class="login-container">
        <div class="login-card">
          <div class="login-header">
            <div class="logo-container">
              <div class="logo-icon">MD</div>
            </div>
            <h1 class="title">MedConsult</h1>
            <p class="subtitle">Medical Consultation Platform</p>
          </div>

          <div class="login-body">
            <h2 class="welcome-text">Welcome back</h2>
            <p class="instruction-text">Sign in to your account to continue</p>

            <button (click)="login()" class="login-button">
              <svg class="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>

            <div class="login-footer">
              <p>By signing in, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></p>
            </div>
          </div>
        </div>

        <div class="info-card">
          <div class="info-content">
            <h2>Streamline Your Medical Consultations</h2>
            <ul class="feature-list">
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Record and transcribe patient consultations
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Generate AI-powered consultation summaries
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Secure storage and easy access to patient records
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8fafc;
      padding: 1rem;
    }

    .login-container {
      display: flex;
      max-width: 1000px;
      width: 100%;
      border-radius: 0.75rem;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    }

    .login-card {
      background: white;
      padding: 2.5rem;
      width: 50%;
      display: flex;
      flex-direction: column;
    }

    .info-card {
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      color: white;
      padding: 2.5rem;
      width: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo-container {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .logo-icon {
      background-color: #0ea5e9;
      color: white;
      width: 3rem;
      height: 3rem;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.25rem;
    }

    .title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #0f172a;
      margin: 0.5rem 0 0.25rem;
    }

    .subtitle {
      color: #64748b;
      margin: 0;
      font-size: 0.875rem;
    }

    .login-body {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .welcome-text {
      font-size: 1.25rem;
      font-weight: 600;
      color: #0f172a;
      margin: 0 0 0.5rem 0;
      text-align: center;
    }

    .instruction-text {
      color: #64748b;
      margin: 0 0 2rem 0;
      text-align: center;
      font-size: 0.875rem;
    }

    .login-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 0.75rem 1.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      background: white;
      color: #0f172a;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .login-button:hover {
      background-color: #f8fafc;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .google-icon {
      width: 1.25rem;
      height: 1.25rem;
    }

    .login-footer {
      margin-top: 2rem;
      text-align: center;
      font-size: 0.75rem;
      color: #64748b;
    }

    .login-footer a {
      color: #0ea5e9;
      text-decoration: none;
    }

    .login-footer a:hover {
      text-decoration: underline;
    }

    .info-content {
      max-width: 90%;
    }

    .info-content h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 1.5rem 0;
    }

    .feature-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .feature-list li {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      font-size: 0.95rem;
    }

    .feature-icon {
      width: 1.25rem;
      height: 1.25rem;
      flex-shrink: 0;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .login-container {
        flex-direction: column;
      }

      .login-card, .info-card {
        width: 100%;
      }

      .info-card {
        order: -1;
        padding: 2rem;
      }
    }
  `]
})
export class LoginComponent {
  constructor(private authService: AuthService) {
  }

  login() {
    this.authService.initiateGoogleLogin();
  }
}
