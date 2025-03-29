import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MotmService } from '../../services/motm.service';
import { TeamService } from '../../services/team.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-motm-standings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">Classifica Man of the Match</h5>
        </div>
        <div class="card-body px-0 px-md-3">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th class="position">Pos</th>
                  <th>Giocatore</th>
                  <th class="team">Squadra</th>
                  <th class="motm">MOTM</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let standing of motmStandings$ | async; let i = index">
                  <td class="position">{{i + 1}}</td>
                  <td class="player-cell">
                    <a [routerLink]="['/profile', standing.user.uid]" class="player-link">
                      {{standing.user.displayName || 'Giocatore senza nome'}}
                    </a>
                  </td>
                  <td class="team">{{getTeamName(standing.user.teamId)}}</td>
                  <td class="motm"><strong>{{standing.motmCount}}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table {
      margin: 0;
    }
    .table th {
      font-size: 0.9rem;
      font-weight: 500;
      white-space: nowrap;
    }
    .table td {
      font-size: 0.9rem;
      vertical-align: middle;
    }
    .position {
      width: 50px;
      text-align: center;
    }
    .motm {
      width: 60px;
      text-align: center;
      font-size: 1.1rem;
      color: #0d6efd;
    }
    .team {
      width: 30%;
    }
    .player-cell {
      min-width: 150px;
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
      .table {
        font-size: 0.85rem;
      }
      .position {
        width: 40px;
        padding-left: 8px !important;
        padding-right: 8px !important;
      }
      .motm {
        width: 50px;
        padding-left: 8px !important;
        padding-right: 8px !important;
      }
      .team {
        width: auto;
        max-width: 100px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .player-cell {
        min-width: 120px;
      }
      .card-body {
        padding: 0;
      }
      .table td, .table th {
        padding: 12px 8px;
      }
    }
  `]
})
export class MotmStandingsComponent {
  motmStandings$: any;
  teamNames: { [key: string]: string } = {};

  constructor(
    private motmService: MotmService,
    private teamService: TeamService
  ) {
    this.motmStandings$ = this.motmService.getMotmStandings();
    
    // Carica i nomi delle squadre
    this.teamService.getTeams().subscribe(teams => {
      teams.forEach(team => {
        this.teamNames[team.id] = team.name;
      });
    });
  }

  getTeamName(teamId: string | undefined): string {
    if (!teamId) return 'Senza squadra';
    return this.teamNames[teamId] || 'Squadra non trovata';
  }
} 