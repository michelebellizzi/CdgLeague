import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Observable, map, of, switchMap } from 'rxjs';
import { User } from '../../models/user.model';
import { Team } from '../../models/team.model';
import { Match } from '../../models/match.model';
import { AuthService } from '../../services/auth.service';
import { PlayerService } from '../../services/player.service';
import { TeamService } from '../../services/team.service';
import { MatchService } from '../../services/match.service';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="row">
        <!-- Profilo Utente -->
        <div class="col-md-4">
          <div class="card">
            <div class="card-body text-center">
              <div class="profile-photo-container mb-3">
                <img [src]="(user$ | async)?.photoURL || defaultAvatar" 
                     class="profile-photo" 
                     alt="Profile photo">
                <div class="upload-overlay" *ngIf="isOwnProfile">
                  <input type="text" 
                         [(ngModel)]="photoUrl" 
                         class="form-control form-control-sm mb-2" 
                         placeholder="Inserisci URL immagine">
                  <button class="btn btn-sm btn-primary" 
                          (click)="updatePhoto()">
                    Aggiorna Foto
                  </button>
                </div>
              </div>
              <h4 class="mb-0">{{(user$ | async)?.displayName}}</h4>
              <p class="text-muted">{{(team$ | async)?.name || 'Nessuna Squadra'}}</p>
            </div>
          </div>

          <!-- Statistiche -->
          <div class="card mt-3">
            <div class="card-header">
              <h5 class="mb-0">Statistiche</h5>
            </div>
            <div class="card-body">
              <div class="stat-item">
                <span class="stat-label">Gol Segnati</span>
                <span class="stat-value">{{(user$ | async)?.goals || 0}}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Partite Giocate</span>
                <span class="stat-value">{{matchesPlayed}}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Man of the Match</span>
                <span class="stat-value">{{motmCount}}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Ultime Partite -->
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Le Mie Partite</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Partita</th>
                      <th>Risultato</th>
                      <th>Gol</th>
                      <th>MOTM</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let match of userMatches$ | async">
                      <td>{{match.date | date:'dd/MM/yyyy'}}</td>
                      <td>
                        {{getTeamName(match.homeTeamId)}} vs {{getTeamName(match.awayTeamId)}}
                      </td>
                      <td>
                        <span *ngIf="match.completed">
                          {{match.homeScore}} - {{match.awayScore}}
                        </span>
                        <span *ngIf="!match.completed">Da giocare</span>
                      </td>
                      <td>
                        {{getPlayerGoalsInMatch(match)}}
                      </td>
                      <td>
                        <i *ngIf="isMotmInMatch(match)" 
                           class="bi bi-star-fill text-warning"></i>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-photo-container {
      position: relative;
      width: 150px;
      height: 150px;
      margin: 0 auto;
      border-radius: 50%;
      overflow: hidden;
    }
    .profile-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .upload-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0,0,0,0.7);
      padding: 8px;
      display: none;
    }
    .profile-photo-container:hover .upload-overlay {
      display: block;
    }
    .file-input {
      display: none;
    }
    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .stat-item:last-child {
      border-bottom: none;
    }
    .stat-label {
      color: #666;
    }
    .stat-value {
      font-weight: bold;
      color: #0d6efd;
    }
  `]
})
export class UserProfileComponent implements OnInit {
  private storage = inject(Storage);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private playerService = inject(PlayerService);
  private teamService = inject(TeamService);
  private matchService = inject(MatchService);
  public defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyOCIgZmlsbD0iI2U5ZWNlZiIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjEwMCIgcj0iNTAiIGZpbGw9IiNhZGI1YmQiLz48cGF0aCBkPSJNMjMwIDIyMGMwLTQ0LjE4LTM1LjgyLTgwLTgwLTgwaC05NmMtNDQuMTggMC04MCAzNS44Mi04MCA4MGgyNTZ6IiBmaWxsPSIjYWRiNWJkIi8+PC9zdmc+';
  photoUrl: string = '';
  user$: Observable<User | null> = of(null);
  team$: Observable<Team | null> = of(null);
  userMatches$: Observable<Match[]> = of([]);
  teamNames: Record<string, string> = {};
  matchesPlayed = 0;
  motmCount = 0;
  currentUserId: string | null = null;
  isOwnProfile = false;

  constructor() {
    // Carica i nomi delle squadre
    this.teamService.getTeams().subscribe(teams => {
      teams.forEach(team => {
        if (team.id) {
          this.teamNames[team.id] = team.name;
        }
      });
    });

    // Gestisci il parametro id dalla route
    this.route.params.pipe(
      switchMap(params => {
        const userId = params['id'];
        if (userId) {
          this.isOwnProfile = false;
          return this.playerService.getPlayer(userId);
        } else {
          this.isOwnProfile = true;
          return this.playerService.getCurrentUser();
        }
      })
    ).subscribe(user => {
      if (user) {
        this.currentUserId = user.uid;
        this.user$ = of(user);
        this.team$ = user.teamId ? this.teamService.getTeam(user.teamId) : of(null);
        this.loadUserMatches(user.teamId);
      }
    });
  }

  ngOnInit(): void {}

  loadUserMatches(teamId: string | undefined): void {
    if (!teamId) return;
    
    this.matchService.getMatches().subscribe(matches => {
      const userMatches = matches.filter(match => 
        match.homeTeamId === teamId || match.awayTeamId === teamId
      );
      
      this.matchesPlayed = userMatches.filter(m => m.completed).length;
      this.motmCount = userMatches.filter(m => m.motm === this.currentUserId).length;
      this.userMatches$ = of(userMatches);
    });
  }

  getTeamName(teamId: string): string {
    return this.teamNames[teamId] || 'Squadra Sconosciuta';
  }

  getPlayerGoalsInMatch(match: Match): number {
    if (!match.scorers || !this.currentUserId) return 0;
    return match.scorers[this.currentUserId] || 0;
  }

  isMotmInMatch(match: Match): boolean {
    if (!this.currentUserId) return false;
    return match.motm === this.currentUserId;
  }

  async updatePhoto(): Promise<void> {
    if (!this.photoUrl || !this.currentUserId) return;

    try {
      // Verifica che l'URL sia valido
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = this.photoUrl;
      });

      // Aggiorna il profilo utente con la nuova foto
      await this.playerService.updatePlayer(this.currentUserId, { photoURL: this.photoUrl });
      
      // Resetta l'input
      this.photoUrl = '';
      
      console.log('Foto del profilo aggiornata con successo');
    } catch (error) {
      console.error('Errore durante l\'aggiornamento della foto:', error);
      alert('Errore durante l\'aggiornamento della foto. Verifica che l\'URL sia valido e che l\'immagine sia accessibile.');
    }
  }
} 