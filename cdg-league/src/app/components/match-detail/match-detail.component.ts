import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, map, filter, combineLatest } from 'rxjs';
import { Match } from '../../models/match.model';
import { Team } from '../../models/team.model';
import { User } from '../../models/user.model';
import { MatchService } from '../../services/match.service';
import { TeamService } from '../../services/team.service';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="match-header">
        <div class="row align-items-center">
          <!-- Squadra Casa -->
          <div class="col-12 col-md-5 text-center text-md-end mb-4 mb-md-0">
            <div class="team-info">
              <div class="team-header">
                <div class="team-logo">
                  <img [src]="getTeamLogo(match$ | async, 'home')" [alt]="getTeamName(match$ | async, 'home')">
                </div>
                <h2>
                  <a [routerLink]="['/team', (match$ | async)?.homeTeamId]" class="team-link">
                    {{getTeamName(match$ | async, 'home')}}
                  </a>
                </h2>
                <div class="team-colors">
                  <div *ngFor="let color of getTeamColors(match$ | async, 'home')" 
                       class="color-dot" 
                       [style.background-color]="color">
                  </div>
                </div>
              </div>
              <div class="team-players" *ngIf="homePlayers$ | async as players">
                <div class="players-grid">
                  <div *ngFor="let player of players" class="player-card">
                    <div class="player-photo">
                      <img [src]="player.photoURL || defaultAvatar" [alt]="player.displayName">
                    </div>
                    <div class="player-name">
                      <a [routerLink]="['/profile', player.uid]" class="player-link">
                        {{player.displayName}}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Risultato -->
          <div class="col-12 col-md-2 text-center mb-4 mb-md-0">
            <div class="match-info">
              <div class="score" *ngIf="(match$ | async)?.completed">
                <h1>{{(match$ | async)?.homeScore}} - {{(match$ | async)?.awayScore}}</h1>
              </div>
              <div *ngIf="!(match$ | async)?.completed" class="vs">
                <h1>vs</h1>
              </div>
              <div class="match-date">
                {{(match$ | async)?.date | date:'dd/MM/yyyy HH:mm'}}
              </div>
              <div class="matchday">
                Giornata {{(match$ | async)?.matchday}}
              </div>
            </div>
          </div>

          <!-- Squadra Ospite -->
          <div class="col-12 col-md-5 text-center text-md-start">
            <div class="team-info">
              <div class="team-header">
                <div class="team-colors">
                  <div *ngFor="let color of getTeamColors(match$ | async, 'away')" 
                       class="color-dot" 
                       [style.background-color]="color">
                  </div>
                </div>
                <h2>
                  <a [routerLink]="['/team', (match$ | async)?.awayTeamId]" class="team-link">
                    {{getTeamName(match$ | async, 'away')}}
                  </a>
                </h2>
                <div class="team-logo">
                  <img [src]="getTeamLogo(match$ | async, 'away')" [alt]="getTeamName(match$ | async, 'away')">
                </div>
              </div>
              <div class="team-players" *ngIf="awayPlayers$ | async as players">
                <div class="players-grid">
                  <div *ngFor="let player of players" class="player-card">
                    <div class="player-photo">
                      <img [src]="player.photoURL || defaultAvatar" [alt]="player.displayName">
                    </div>
                    <div class="player-name">
                      <a [routerLink]="['/profile', player.uid]" class="player-link">
                        {{player.displayName}}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="match-details mt-4" *ngIf="(match$ | async)?.completed">
        <!-- Marcatori -->
        <div class="card mb-4">
          <div class="card-header">
            <h4 class="mb-0">Marcatori</h4>
          </div>
          <div class="card-body">
            <div class="row">
              <!-- Marcatori Casa -->
              <div class="col-12 col-md-6 mb-4 mb-md-0">
                <div class="scorers-list">
                  <div *ngFor="let scorer of getHomeScorers(match$ | async)" class="scorer-item">
                    <div class="scorer-info">
                      <img [src]="getPlayerPhoto(scorer.playerId) || defaultAvatar" 
                           [alt]="scorer.name" 
                           class="scorer-photo">
                      <a [routerLink]="['/profile', scorer.playerId]" class="player-link">
                        {{scorer.name}}
                      </a>
                    </div>
                    <span class="goals">{{scorer.goals}}</span>
                  </div>
                </div>
              </div>
              <!-- Marcatori Ospite -->
              <div class="col-12 col-md-6">
                <div class="scorers-list">
                  <div *ngFor="let scorer of getAwayScorers(match$ | async)" class="scorer-item">
                    <div class="scorer-info">
                      <img [src]="getPlayerPhoto(scorer.playerId) || defaultAvatar" 
                           [alt]="scorer.name" 
                           class="scorer-photo">
                      <a [routerLink]="['/profile', scorer.playerId]" class="player-link">
                        {{scorer.name}}
                      </a>
                    </div>
                    <span class="goals">{{scorer.goals}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Man of the Match -->
        <div class="card" *ngIf="(match$ | async)?.motm">
          <div class="card-header">
            <h4 class="mb-0">Man of the Match</h4>
          </div>
          <div class="card-body">
            <div class="motm-player">
              <img [src]="getPlayerPhoto((match$ | async)?.motm) || defaultAvatar" 
                   [alt]="getPlayerName((match$ | async)?.motm)" 
                   class="motm-photo">
              <div class="motm-info">
                <i class="bi bi-star-fill text-warning"></i>
                <a [routerLink]="['/profile', (match$ | async)?.motm]" class="player-link">
                  {{getPlayerName((match$ | async)?.motm)}}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .match-header {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 20px;
      margin-bottom: 20px;
    }
    .team-info {
      padding: 10px;
    }
    .team-info h2 {
      margin-bottom: 15px;
      color: #333;
      font-size: 1.5rem;
    }
    .match-info {
      padding: 10px;
    }
    .score h1 {
      font-size: 2.5rem;
      font-weight: bold;
      color: #0d6efd;
      margin: 0;
    }
    .vs h1 {
      font-size: 2rem;
      color: #6c757d;
      margin: 0;
    }
    .match-date {
      color: #666;
      font-size: 0.9rem;
      margin-top: 10px;
    }
    .matchday {
      color: #0d6efd;
      font-weight: bold;
      margin-top: 5px;
    }
    .team-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .team-logo {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border-radius: 50%;
      padding: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border: 2px solid #dee2e6;
      overflow: hidden;
    }
    .team-logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 50%;
    }
    .team-colors {
      display: flex;
      gap: 5px;
    }
    .color-dot {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .players-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 10px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .player-card {
      text-align: center;
      background: white;
      padding: 8px;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }
    .player-card:hover {
      transform: translateY(-2px);
    }
    .player-photo {
      width: 50px;
      height: 50px;
      margin: 0 auto 8px;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid #dee2e6;
    }
    .player-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .player-name {
      font-size: 0.8rem;
      color: #333;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .scorers-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .scorer-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px;
      background: #f8f9fa;
      border-radius: 4px;
    }
    .scorer-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .scorer-photo {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }
    .goals {
      background: #0d6efd;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: bold;
    }
    .motm-player {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .motm-photo {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #ffc107;
    }
    .motm-info {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.2rem;
      font-weight: 500;
      color: #333;
    }
    .card {
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .card-header {
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }
    .card-header h4 {
      color: #333;
      margin: 0;
    }
    .team-link {
      text-decoration: none;
      color: inherit;
      transition: color 0.2s;
    }
    .team-link:hover {
      color: #0d6efd;
    }
    .player-link {
      color: #333;
      text-decoration: none;
      transition: color 0.2s;
    }
    .player-link:hover {
      color: #0d6efd;
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .team-header {
        flex-direction: column;
        gap: 10px;
      }
      .score h1 {
        font-size: 2rem;
      }
      .vs h1 {
        font-size: 1.5rem;
      }
      .players-grid {
        grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
        gap: 8px;
      }
      .player-photo {
        width: 40px;
        height: 40px;
      }
      .player-name {
        font-size: 0.75rem;
      }
      .motm-player {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class MatchDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private matchService = inject(MatchService);
  private teamService = inject(TeamService);
  private playerService = inject(PlayerService);

  match$!: Observable<Match>;
  homePlayers$!: Observable<User[]>;
  awayPlayers$!: Observable<User[]>;
  private teams: { [key: string]: { name: string; logo: string; colors: string | string[] } } = {};
  private players: { [key: string]: User } = {};
  defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyOCIgZmlsbD0iI2U5ZWNlZiIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjEwMCIgcj0iNTAiIGZpbGw9IiNhZGI1YmQiLz48cGF0aCBkPSJNMjMwIDIyMGMwLTQ0LjE4LTM1LjgyLTgwLTgwLTgwaC05NmMtNDQuMTggMC04MCAzNS44Mi04MCA4MGgyNTZ6IiBmaWxsPSIjYWRiNWJkIi8+PC9zdmc+';

  // Mappa di conversione dei colori
  private colorMap: { [key: string]: string } = {
    'rosso': '#FF0000',
    'blu': '#0000FF',
    'verde': '#00FF00',
    'giallo': '#FFFF00',
    'bianco': '#FFFFFF',
    'nero': '#000000',
    'grigio': '#808080',
    'arancione': '#FFA500',
    'viola': '#800080',
    'rosa': '#FFC0CB',
    'azzurro': '#00FFFF',
    'marrone': '#A52A2A',
    'beige': '#F5F5DC',
    'turchese': '#40E0D0',
    'lime': '#00FF00',
    'fucsia': '#FF00FF',
    'ciano': '#00FFFF',
    'indaco': '#4B0082',
    'coral': '#FF7F50',
    'crimson': '#DC143C',
    'darkblue': '#00008B',
    'darkgreen': '#006400',
    'darkred': '#8B0000',
    'gold': '#FFD700',
    'navy': '#000080',
    'olive': '#808000',
    'purple': '#800080',
    'silver': '#C0C0C0',
    'teal': '#008080'
  };

  constructor() {
    // Carica i nomi delle squadre
    this.teamService.getTeams().subscribe(teams => {
      teams.forEach(team => {
        if (team.id) {
          this.teams[team.id] = {
            name: team.name,
            logo: team.logo || this.defaultAvatar,
            colors: team.colors
          };
        }
      });
    });

    // Carica i giocatori
    this.playerService.getPlayers().subscribe(players => {
      players.forEach(player => {
        this.players[player.uid] = player;
      });
    });
  }

  ngOnInit(): void {
    const matchId = this.route.snapshot.paramMap.get('id');
    if (matchId) {
      this.match$ = this.matchService.getMatch(matchId).pipe(
        filter((match): match is Match => match !== null)
      );

      this.match$.subscribe(match => {
        console.log('Match data:', match);
        this.homePlayers$ = this.playerService.getPlayersByTeam(match.homeTeamId);
        this.awayPlayers$ = this.playerService.getPlayersByTeam(match.awayTeamId);
      });
    }
  }

  getTeamName(match: Match | null, side: 'home' | 'away'): string {
    if (!match) return '';
    const teamId = side === 'home' ? match.homeTeamId : match.awayTeamId;
    return this.teams[teamId]?.name || 'Squadra Sconosciuta';
  }

  getTeamLogo(match: Match | null, side: 'home' | 'away'): string {
    if (!match) return '';
    const teamId = side === 'home' ? match.homeTeamId : match.awayTeamId;
    return this.teams[teamId]?.logo || this.defaultAvatar;
  }

  getTeamColors(match: Match | null, side: 'home' | 'away'): string[] {
    if (!match) return [];
    const teamId = side === 'home' ? match.homeTeamId : match.awayTeamId;
    const colors = this.teams[teamId]?.colors;
    if (!colors) return [];
    // Se colors è una stringa, la convertiamo in array
    if (typeof colors === 'string') {
      return colors.split(',').map((color: string) => {
        const trimmedColor = color.trim().toLowerCase();
        return this.colorMap[trimmedColor] || trimmedColor;
      });
    }
    // Se è già un array, lo restituiamo convertendo i colori
    return (colors as string[]).map(color => {
      const trimmedColor = color.trim().toLowerCase();
      return this.colorMap[trimmedColor] || trimmedColor;
    });
  }

  getPlayerName(playerId: string | undefined): string {
    if (!playerId) return '';
    return this.players[playerId]?.displayName || 'Giocatore Sconosciuto';
  }

  getPlayerPhoto(playerId: string | undefined): string | undefined {
    if (!playerId) return undefined;
    return this.players[playerId]?.photoURL;
  }

  getHomeScorers(match: Match | null): { name: string; goals: number; playerId: string }[] {
    if (!match?.scorers) {
      console.log('No scorers found for match:', match);
      return [];
    }
    console.log('Scorers for home team:', match.scorers);
    const scorers = Object.entries(match.scorers)
      .filter(([playerId]) => {
        const player = this.players[playerId];
        return player && this.isPlayerInTeam(playerId, match.homeTeamId);
      })
      .map(([playerId, goals]) => ({
        name: this.getPlayerName(playerId),
        goals: Number(goals),
        playerId
      }));
    console.log('Filtered home scorers:', scorers);
    return scorers;
  }

  getAwayScorers(match: Match | null): { name: string; goals: number; playerId: string }[] {
    if (!match?.scorers) {
      console.log('No scorers found for match:', match);
      return [];
    }
    console.log('Scorers for away team:', match.scorers);
    const scorers = Object.entries(match.scorers)
      .filter(([playerId]) => {
        const player = this.players[playerId];
        return player && this.isPlayerInTeam(playerId, match.awayTeamId);
      })
      .map(([playerId, goals]) => ({
        name: this.getPlayerName(playerId),
        goals: Number(goals),
        playerId
      }));
    console.log('Filtered away scorers:', scorers);
    return scorers;
  }

  private isPlayerInTeam(playerId: string, teamId: string): boolean {
    const player = this.players[playerId];
    return player?.teamId === teamId;
  }
}
