import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import { NavComponent } from './components/nav/nav.component';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, NgbModule, NavComponent, NavbarComponent],
  template: `
    <app-nav *ngIf="!isLoginPage"></app-nav>
    <div class="container mt-4">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'cdg-league';
  isLoginPage = false;
  currentUser$: Observable<any>;
  isAdmin$: Observable<boolean>;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.currentUser$ = this.authService.getCurrentUser();
    this.isAdmin$ = this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isLoginPage = event.url === '/login';
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);  // Redirect to login after logout
  }
}
