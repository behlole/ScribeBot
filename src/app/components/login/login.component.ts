// src/app/components/login/login.component.ts
import {Component} from '@angular/core';
import {AuthService} from "../../services/AuthService.service";

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="login-container">
      <div class="login-box">
        <h1>Welcome</h1>
        <p>Sign in with your Google Workspace account</p>
        <button (click)="login()" class="login-button">
          <img src="assets/google-icon.svg" alt="Google" class="google-icon">
          Sign in with Google
        </button>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
    }

    .login-box {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .login-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 24px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .login-button:hover {
      background-color: #f8f8f8;
    }

    .google-icon {
      width: 24px;
      height: 24px;
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
