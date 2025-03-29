import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { TeamService } from '../../services/team.service';
import { Match } from '../../models/match.model';
import { Team } from '../../models/team.model';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="row">
        <!-- Prossime Partite e Ultima Partita -->
        <div class="col-12 col-md-8">
          <!-- Prossime Partite -->
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Prossime Partite</h5>
            </div>
            <div class="card-body">
              <div class="next-matches">
                <div *ngFor="let match of nextMatches$ | async" class="match-card">
                  <a [routerLink]="['/match', match.id]" class="match-link">
                    <div class="match-date">
                      {{match.date | date:'dd/MM/yyyy HH:mm'}}
                    </div>
                    <div class="match-teams">
                      <div class="team home">
                        <a [routerLink]="['/team', match.homeTeamId]" class="team-link">
                          {{getTeamName(match.homeTeamId)}}
                        </a>
                      </div>
                      <div class="match-result">
                        <span class="vs">vs</span>
                      </div>
                      <div class="team away">
                        <a [routerLink]="['/team', match.awayTeamId]" class="team-link">
                          {{getTeamName(match.awayTeamId)}}
                        </a>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Ultima Partita -->
          <div class="card mt-3" *ngIf="lastMatch$ | async as lastMatch">
            <div class="card-header">
              <h5 class="mb-0">Ultima Partita</h5>
            </div>
            <div class="card-body">
              <a [routerLink]="['/match', lastMatch.id]" class="match-link">
                <div class="match-date">
                  {{lastMatch.date | date:'dd/MM/yyyy HH:mm'}}
                </div>
                <div class="match-teams">
                  <div class="team home">
                    <a [routerLink]="['/team', lastMatch.homeTeamId]" class="team-link">
                      {{getTeamName(lastMatch.homeTeamId)}}
                    </a>
                  </div>
                  <div class="match-result">
                    <span class="score">{{lastMatch.homeScore}} - {{lastMatch.awayScore}}</span>
                  </div>
                  <div class="team away">
                    <a [routerLink]="['/team', lastMatch.awayTeamId]" class="team-link">
                      {{getTeamName(lastMatch.awayTeamId)}}
                    </a>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <!-- Classifica Abbreviata -->
        <div class="col-12 col-md-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Classifica</h5>
            </div>
            <div class="card-body">
              <div class="standings-list">
                <div *ngFor="let team of standings$ | async; let i = index" class="standing-item">
                  <div class="position">{{i + 1}}</div>
                  <div class="team-name">
                    <a [routerLink]="['/team', team.id]" class="team-link">
                      {{team.name}}
                    </a>
                  </div>
                  <div class="points">{{team.points || 0}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .next-matches {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .match-card {
      background: #f8f9fa;
      border-radius: 8px;
      overflow: hidden;
    }
    .match-link {
      text-decoration: none;
      color: inherit;
      display: block;
      padding: 1rem;
      transition: background-color 0.2s;
    }
    .match-link:hover {
      background-color: #e9ecef;
    }
    .match-date {
      font-size: 0.9rem;
      color: #6c757d;
      margin-bottom: 0.5rem;
      text-align: center;
    }
    .match-teams {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .team {
      font-weight: 500;
      flex: 1;
      text-align: center;
    }
    .match-result {
      min-width: 60px;
      text-align: center;
    }
    .vs {
      color: #6c757d;
      font-weight: 500;
    }
    .score {
      color: #0d6efd;
      font-weight: bold;
      font-size: 1.2rem;
    }
    .standings-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .standing-item {
      display: flex;
      align-items: center;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    .standing-item:hover {
      background-color: #e9ecef;
    }
    .position {
      width: 30px;
      font-weight: bold;
      color: #0d6efd;
    }
    .team-name {
      flex: 1;
      font-weight: 500;
    }
    .points {
      font-weight: bold;
      color: #0d6efd;
    }
    .team-link {
      text-decoration: none;
      color: inherit;
      transition: color 0.2s;
    }
    .team-link:hover {
      color: #0d6efd;
    }

    @media (max-width: 768px) {
      .match-teams {
        flex-direction: column;
        gap: 0.5rem;
      }
      .team {
        width: 100%;
      }
      .match-result {
        margin: 0.5rem 0;
      }
      .score {
        font-size: 1.1rem;
      }
      .standing-item {
        padding: 0.75rem;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  nextMatches$: Observable<Match[]>;
  lastMatch$: Observable<Match | null>;
  standings$: Observable<Team[]>;
  private teams: { [key: string]: string } = {};

  constructor(
    private matchService: MatchService,
    private teamService: TeamService
  ) {
    this.nextMatches$ = this.matchService.getNextMatches();
    this.lastMatch$ = this.matchService.getLastMatch();
    this.standings$ = this.teamService.getTeams().pipe(
      map(teams => teams.sort((a, b) => (b.points || 0) - (a.points || 0)))
    );

    // Carica i nomi delle squadre
    this.teamService.getTeams().subscribe(teams => {
      teams.forEach(team => {
        this.teams[team.id] = team.name;
      });
    });
  }

  ngOnInit(): void {}

  getTeamName(teamId: string): string {
    return this.teams[teamId] || 'Squadra non trovata';
  }
}
