import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatchService } from '../../../services/match.service';
import { TeamService } from '../../../services/team.service';
import { Match } from '../../../models/match.model';
import { Team } from '../../../models/team.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mt-4">
      <h2>Gestione Partite</h2>

      <!-- Form per creare una nuova partita -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Crea Nuova Partita</h5>
          <form [formGroup]="matchForm" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label for="homeTeamId" class="form-label">Squadra Casa</label>
              <select class="form-select" id="homeTeamId" formControlName="homeTeamId">
                <option value="">Seleziona una squadra</option>
                <option *ngFor="let team of teams$ | async" [value]="team.id">
                  {{ team.name }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label for="awayTeamId" class="form-label">Squadra Trasferta</label>
              <select class="form-select" id="awayTeamId" formControlName="awayTeamId">
                <option value="">Seleziona una squadra</option>
                <option *ngFor="let team of teams$ | async" [value]="team.id">
                  {{ team.name }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label for="date" class="form-label">Data e Ora</label>
              <input type="datetime-local" class="form-control" id="date" formControlName="date">
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="!matchForm.valid">Crea Partita</button>
          </form>
        </div>
      </div>

      <!-- Lista delle partite -->
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Partite Esistenti</h5>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Squadra Casa</th>
                  <th>Squadra Trasferta</th>
                  <th>Risultato</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let match of matches$ | async">
                  <td>{{ match.date | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>{{ getTeamName(match.homeTeamId) | async }}</td>
                  <td>{{ getTeamName(match.awayTeamId) | async }}</td>
                  <td>
                    <ng-container *ngIf="match.completed">
                      {{ match.homeScore }} - {{ match.awayScore }}
                    </ng-container>
                    <ng-container *ngIf="!match.completed">
                      -
                    </ng-container>
                  </td>
                  <td>
                    <button class="btn btn-danger btn-sm me-2" (click)="deleteMatch(match.id)">
                      Elimina
                    </button>
                    <button *ngIf="!match.completed" 
                            class="btn btn-success btn-sm" 
                            (click)="completeMatch(match)">
                      Completa
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MatchesComponent implements OnInit {
  matchForm: FormGroup;
  matches$: Observable<Match[]>;
  teams$: Observable<Team[]>;

  constructor(
    private fb: FormBuilder,
    private matchService: MatchService,
    private teamService: TeamService
  ) {
    this.matchForm = this.fb.group({
      homeTeamId: ['', Validators.required],
      awayTeamId: ['', Validators.required],
      date: ['', Validators.required]
    });
    this.matches$ = this.matchService.getMatches();
    this.teams$ = this.teamService.getTeams();
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.matchForm.valid) {
      const match = {
        ...this.matchForm.value,
        date: new Date(this.matchForm.value.date),
        completed: false,
        homeScore: 0,
        awayScore: 0,
        scorers: {}
      };
      this.matchService.createMatch(match)
        .then(() => {
          this.matchForm.reset();
        })
        .catch(error => {
          console.error('Errore nella creazione della partita:', error);
        });
    }
  }

  deleteMatch(id: string): void {
    if (confirm('Sei sicuro di voler eliminare questa partita?')) {
      this.matchService.deleteMatch(id)
        .catch(error => {
          console.error('Errore nell\'eliminazione della partita:', error);
        });
    }
  }

  completeMatch(match: Match): void {
    // TODO: Implementare la logica per completare una partita
    console.log('Completare partita:', match);
  }

  getTeamName(teamId: string): Observable<string> {
    return this.teamService.getTeam(teamId).pipe(
      map(team => team?.name || '')
    );
  }
} 