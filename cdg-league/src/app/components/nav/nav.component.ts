import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav *ngIf="!isLoginPage" class="navbar navbar-expand-lg navbar-dark">
      <div class="container">
        <a class="navbar-brand" routerLink="/">No Fenomeni - No Sentaioli</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/calendar" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                <i class="bi bi-calendar-event"></i> Calendario
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/standings" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                <i class="bi bi-trophy"></i> Classifica
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/scorers" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                <i class="bi bi-ball"></i> Marcatori
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/motm" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                <i class="bi bi-star"></i> MOTM
              </a>
            </li>
          </ul>
          <ul class="navbar-nav">
            <ng-container *ngIf="currentUser$ | async as user">
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="bi bi-person-circle"></i> {{ user.displayName }}
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <a class="dropdown-item" routerLink="/profile">
                      <i class="bi bi-person"></i> Profilo
                    </a>
                  </li>
                  <li *ngIf="isAdmin$ | async">
                    <a class="dropdown-item" routerLink="/admin">
                      <i class="bi bi-gear"></i> Admin
                    </a>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item text-danger" (click)="logout()" style="cursor: pointer;">
                      <i class="bi bi-box-arrow-right"></i> Logout
                    </a>
                  </li>
                </ul>
              </li>
            </ng-container>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: linear-gradient(135deg, #2c3e50, #3498db); /* Gradiente blu */
      border-bottom: 2px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }

    .navbar-brand {
      font-weight: 700;
      font-size: 1.4rem;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #fff;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    }

    .nav-link {
      font-weight: 500;
      font-size: 1rem;
      color: #ecf0f1;
      padding: 0.8rem 1rem;
      transition: all 0.3s ease;
      border-radius: 4px;
    }

    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: #3498db;
      transform: scale(1.05);
    }

    .nav-link i {
      margin-right: 0.5rem;
      transition: all 0.2s ease;
    }

    .nav-link:hover i {
      transform: rotate(10deg);
    }

    .dropdown-menu {
      background: #34495e;
      border-radius: 4px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    }

    .dropdown-item {
      color: #ecf0f1;
      padding: 0.8rem 1.2rem;
    }

    .dropdown-item:hover {
      background-color: rgba(52, 152, 219, 0.2);
      color: #3498db;
    }

    .navbar-toggler-icon {
      background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"%3E%3Cpath stroke="rgba(255, 255, 255, 0.8)" stroke-width="2" d="M3 6h24M3 12h24M3 18h24"/%3E%3C/svg%3E');
    }

    /* Media Query per dispositivi mobili */
    @media (max-width: 768px) {
      .navbar-nav .nav-item {
        padding: 0.5rem 0;
      }

      .navbar-brand {
        font-size: 1.2rem;
      }
    }
  `]
})
export class NavComponent {
  currentUser$: Observable<any>;
  isAdmin$: Observable<boolean>;
  isLoginPage: boolean = false;

  constructor(private authService: AuthService, private router: Router) {
    this.currentUser$ = this.authService.getCurrentUser();
    this.isAdmin$ = this.authService.isAdmin();
    this.router.events.subscribe(() => {
      this.isLoginPage = this.router.url.includes('/login');
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
