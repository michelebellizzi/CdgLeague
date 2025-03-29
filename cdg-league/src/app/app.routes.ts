import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { StandingsComponent } from './components/standings/standings.component';
import { ScorersComponent } from './components/scorers/scorers.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { AdminPanelComponent } from './components/admin/admin-panel/admin-panel.component';
import { MatchDetailComponent } from './components/match-detail/match-detail.component';
import { CreateAdminComponent } from './components/admin/create-admin/create-admin.component';
import { MotmStandingsComponent } from './components/motm-standings/motm-standings.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    loadComponent: () => import('./components/admin/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent)
  },
  {
    path: 'admin/teams',
    canActivate: [AuthGuard, AdminGuard],
    loadComponent: () => import('./components/admin/teams/teams.component').then(m => m.TeamsComponent)
  },
  {
    path: 'admin/matches',
    canActivate: [AuthGuard, AdminGuard],
    loadComponent: () => import('./components/admin/matches/matches.component').then(m => m.MatchesComponent)
  },
  {
    path: 'admin/users',
    canActivate: [AuthGuard, AdminGuard],
    loadComponent: () => import('./components/admin/users/users.component').then(m => m.UsersComponent)
  },
  {
    path: 'calendar',
    loadComponent: () => import('./components/calendar/calendar.component').then(m => m.CalendarComponent)
  },
  {
    path: 'standings',
    loadComponent: () => import('./components/standings/standings.component').then(m => m.StandingsComponent)
  },
  {
    path: 'scorers',
    loadComponent: () => import('./components/scorers/scorers.component').then(m => m.ScorersComponent)
  },
  {
    path: 'motm',
    loadComponent: () => import('./components/motm-standings/motm-standings.component').then(m => m.MotmStandingsComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/user-profile/user-profile.component').then(m => m.UserProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile/:id',
    loadComponent: () => import('./components/user-profile/user-profile.component').then(m => m.UserProfileComponent)
  },
  { path: 'create-admin', component: CreateAdminComponent },
  {
    path: 'match/:id',
    loadComponent: () => import('./components/match-detail/match-detail.component').then(m => m.MatchDetailComponent)
  }
];
