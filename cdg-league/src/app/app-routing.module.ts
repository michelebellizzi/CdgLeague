import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: 'standings', component: StandingsComponent },
  { path: 'scorers', component: ScorersComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: 'admin', component: AdminPanelComponent },
  { path: 'create-admin', component: CreateAdminComponent },
  { path: 'match/:id', component: MatchDetailComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 
