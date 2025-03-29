import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav *ngIf="!isLoginPage" class="navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <a routerLink="/home" class="brand-link">
            <span class="brand-text">No Fenomeni - No Sentaioli</span>
          </a>
        </div>

        <div class="hamburger-menu" (click)="toggleMobileMenu()">
          <div></div>
          <div></div>
          <div></div>
        </div>

        <div class="navbar-menu" [class.mobile-open]="isMobileMenuOpen">
          <a routerLink="/standings" routerLinkActive="active" class="nav-link">Classifica</a>
          <a routerLink="/calendar" routerLinkActive="active" class="nav-link">Calendario</a>
          <a routerLink="/scorers" routerLinkActive="active" class="nav-link">Marcatori</a>
          <a routerLink="/motm" routerLinkActive="active" class="nav-link">MOTM</a>
        </div>

        <div class="navbar-end">
          <div *ngIf="isAuthenticated$ | async" class="user-menu">
            <a routerLink="/profile" routerLinkActive="active" class="nav-link">Profilo</a>
            <a *ngIf="isAdmin$ | async" routerLink="/admin" routerLinkActive="active" class="nav-link">Admin</a>
            <button class="btn-logout" (click)="logout()">Logout</button>
          </div>
          <a *ngIf="!(isAuthenticated$ | async)" routerLink="/login" class="btn-login">Login</a>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    $primary-color: #2c3e50;
    $secondary-color: #3498db;
    $accent-color: #e74c3c;
    $danger-color: #e74c3c;
    $border-radius: 12px;
    $box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    $transition: all 0.3s ease;

    .navbar {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: $box-shadow;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 0.8rem 0;
      width: 100%;
      box-sizing: border-box;

      .navbar-container {
        max-width: 100%;
        margin: 0 auto;
        padding: 0 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
      }

      .navbar-brand .brand-link {
        text-decoration: none;
        color: $primary-color;
        font-weight: bold;
        font-size: 1.2rem;
        letter-spacing: 1px;
        transition: font-size 0.3s ease;
      }

      .navbar-menu {
        display: flex;
        gap: 1rem;
        align-items: center;
        transition: font-size 0.3s ease;

        .nav-link {
          color: $primary-color;
          text-decoration: none;
          font-weight: 500;
          font-size: 1rem;
          padding: 0.5rem 1rem;
          border-radius: $border-radius;
          transition: all 0.3s ease;
        }

        .nav-link:hover {
          color: $secondary-color;
          background: rgba($secondary-color, 0.1);
        }

        .nav-link.active {
          color: $secondary-color;
          background: rgba($secondary-color, 0.1);
        }

        // Media queries per dispositivi mobili
        @media (max-width: 768px) {
          display: none;
          flex-direction: column;
          gap: 1rem;
          position: absolute;
          top: 60px;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.9);
          padding: 1rem 0;
          z-index: 1001;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        &.mobile-open {
          display: flex;
          opacity: 1;
          visibility: visible;
        }
      }

      .navbar-end {
        display: flex;
        align-items: center;
        gap: 1rem;
        justify-content: flex-end;

        .user-menu {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .btn-login,
        .btn-logout {
          padding: 0.5rem 1.5rem;
          border-radius: $border-radius;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: $transition;
          cursor: pointer;
        }

        .btn-login {
          background: linear-gradient(135deg, $primary-color, $secondary-color);
          color: white;
          text-decoration: none;
          border: none;
        }

        .btn-login:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba($secondary-color, 0.3);
        }

        .btn-logout {
          background: rgba($danger-color, 0.1);
          color: $danger-color;
          border: none;
        }

        .btn-logout:hover {
          background: rgba($danger-color, 0.2);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          flex-direction: column;
          justify-content: center;
          gap: 0.5rem;
        }
      }

      .hamburger-menu {
        display: none;
        flex-direction: column;
        gap: 4px;
        cursor: pointer;

        div {
          width: 30px;
          height: 4px;
          background-color: $primary-color;
          transition: 0.3s;
        }

        @media (max-width: 768px) {
          display: flex;
        }
      }
    }

    // Responsività per il testo
    @media (max-width: 1024px) {
      .navbar-brand .brand-link {
        font-size: 1.1rem;
      }

      .navbar-menu .nav-link {
        font-size: 0.9rem;
      }

      .navbar-end .btn-login, .navbar-end .btn-logout {
        font-size: 0.9rem;
      }
    }

    @media (max-width: 768px) {
      .navbar-brand .brand-link {
        font-size: 1rem;
      }

      .navbar-menu .nav-link {
        font-size: 1rem;
        padding: 0.5rem 0.8rem;
      }

      .navbar-end .btn-login, .navbar-end .btn-logout {
        font-size: 1rem;
        padding: 0.4rem 1.2rem;
      }
    }

    @media (max-width: 480px) {
      .navbar-brand .brand-link {
        font-size: 0.9rem;
      }

      .navbar-menu .nav-link {
        font-size: 0.9rem;
        padding: 0.5rem 0.8rem;
      }

      .navbar-end .btn-login, .navbar-end .btn-logout {
        font-size: 0.9rem;
        padding: 0.4rem 1rem;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  isAuthenticated$: Observable<boolean>;
  isAdmin$: Observable<boolean>;
  isLoginPage = false;
  isMobileMenuOpen = false;

  constructor() {
    this.isAuthenticated$ = this.authService.isAuthenticated();
    this.isAdmin$ = this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isLoginPage = this.router.url.includes('/login');
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
  }
}
