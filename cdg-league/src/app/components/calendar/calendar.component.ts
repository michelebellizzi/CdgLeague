import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { TeamService } from '../../services/team.service';
import { Observable } from 'rxjs';
import { Match } from '../../models/match.model';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <h2>Calendario Partite</h2>
      <div class="row">
        <div class="col-12">
          <div *ngIf="matchesByMatchday$ | async as matchesByMatchday">
            <div *ngFor="let matchday of getMatchdays(matchesByMatchday)" class="mb-4">
              <div class="card">
                <div class="card-header">
                  <h3 class="mb-0">Giornata {{matchday}}</h3>
                </div>
                <div class="card-body">
                  <!-- Vista Desktop -->
                  <div class="d-none d-md-block">
                    <div class="table-responsive">
                      <table class="table">
                        <thead>
                          <tr>
                            <th>Data</th>
                            <th>Squadra Casa</th>
                            <th>Risultato</th>
                            <th>Squadra Ospite</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr *ngFor="let match of matchesByMatchday[matchday]">
                            <td>{{match.date | date:'dd/MM/yyyy HH:mm'}}</td>
                            <td>{{getTeamName(match.homeTeamId)}}</td>
                            <td>
                              <a [routerLink]="['/match', match.id]" class="match-link">
                                <span *ngIf="match.completed" class="score">
                                  {{match.homeScore}} - {{match.awayScore}}
                                </span>
                                <span *ngIf="!match.completed" class="vs">vs</span>
                              </a>
                            </td>
                            <td>{{getTeamName(match.awayTeamId)}}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Vista Mobile -->
                  <div class="d-md-none">
                    <div class="match-list">
                      <div *ngFor="let match of matchesByMatchday[matchday]" class="match-card">
                        <div class="match-date">
                          {{match.date | date:'dd/MM/yyyy HH:mm'}}
                        </div>
                        <div class="match-teams">
                          <div class="team home">{{getTeamName(match.homeTeamId)}}</div>
                          <div class="match-result">
                            <a [routerLink]="['/match', match.id]" class="match-link">
                              <span *ngIf="match.completed" class="score">
                                {{match.homeScore}} - {{match.awayScore}}
                              </span>
                              <span *ngIf="!match.completed" class="vs">vs</span>
                            </a>
                          </div>
                          <div class="team away">{{getTeamName(match.awayTeamId)}}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .card-header {
      background-color: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }
    .card-header h3 {
      color: #495057;
      font-size: 1.25rem;
    }
    .match-link {
      text-decoration: none;
      color: inherit;
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    .match-link:hover {
      background-color: #f8f9fa;
    }
    .score {
      font-weight: bold;
      color: #0d6efd;
    }
    .vs {
      color: #6c757d;
    }

    /* Stili Mobile */
    .match-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .match-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
    }
    .match-date {
      font-size: 0.9rem;
      color: #6c757d;
      margin-bottom: 0.5rem;
      text-align: center;
    }
    .match-teams {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .team {
      font-weight: 500;
      text-align: center;
    }
    .match-result {
      margin: 0.5rem 0;
    }
  `]
})
export class CalendarComponent implements OnInit {
  private matchService = inject(MatchService);
  private teamService = inject(TeamService);

  matchesByMatchday$: Observable<{ [key: number]: Match[] }>;
  private teamNames: { [key: string]: string } = {};

  constructor() {
    this.matchesByMatchday$ = this.matchService.getMatchesByMatchday();
    
    // Carica i nomi delle squadre
    this.teamService.getTeams().subscribe(teams => {
      teams.forEach(team => {
        this.teamNames[team.id] = team.name;
      });
    });
  }

  ngOnInit(): void {}

  getMatchdays(matchesByMatchday: { [key: number]: Match[] }): number[] {
    return Object.keys(matchesByMatchday)
      .map(Number)
      .sort((a, b) => a - b);
  }

  getTeamName(teamId: string): string {
    return this.teamNames[teamId] || 'Squadra Sconosciuta';
  }
}
