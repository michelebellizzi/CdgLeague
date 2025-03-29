import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { PlayerService } from '../../../services/player.service';
import { TeamService } from '../../../services/team.service';
import { MatchService } from '../../../services/match.service';
import { NotificationService } from '../../../services/notification.service';
import { Observable, combineLatest, map, of } from 'rxjs';
import { User } from '../../../models/user.model';
import { Team } from '../../../models/team.model';
import { Match } from '../../../models/match.model';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TeamColorsPipe } from '../../../pipes/team-colors.pipe';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NgbModule, TeamColorsPipe],
  template: `
    <div class="container mt-4">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-md-3">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Menu Admin</h5>
            </div>
            <div class="card-body p-0">
              <div class="list-group list-group-flush">
                <a routerLink="/admin/teams" 
                   class="list-group-item list-group-item-action d-flex align-items-center">
                  <i class="bi bi-people me-2"></i>
                  Squadre
                </a>
                <a routerLink="/admin/matches" 
                   class="list-group-item list-group-item-action d-flex align-items-center">
                  <i class="bi bi-calendar-event me-2"></i>
                  Partite
                </a>
                <a routerLink="/admin/users" 
                   class="list-group-item list-group-item-action d-flex align-items-center">
                  <i class="bi bi-person me-2"></i>
                  Utenti
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenuto Principale -->
        <div class="col-md-9">
          <!-- Gestione Partite -->
          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Gestione Partite</h5>
              <button class="btn btn-primary" (click)="openCreateMatchModal(createMatchModal)">
                <i class="bi bi-plus-lg me-2"></i>Nuova Partita
              </button>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Squadre</th>
                      <th>Risultato</th>
                      <th>Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let match of matches$ | async">
                      <td>{{match.date | date:'dd/MM/yyyy HH:mm'}}</td>
                      <td>
                        {{getTeamName(match.homeTeamId)}} vs {{getTeamName(match.awayTeamId)}}
                      </td>
                      <td>
                        <span *ngIf="match.completed" class="badge bg-success">
                          {{match.homeScore}} - {{match.awayScore}}
                        </span>
                        <span *ngIf="!match.completed" class="badge bg-secondary">
                          Da giocare
                        </span>
                      </td>
                      <td>
                        <div class="btn-group">
                          <button class="btn btn-sm btn-outline-primary" 
                                  (click)="openCompleteMatchModal(match, completeMatchModal)">
                            <i class="bi bi-check-lg"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-danger" 
                                  (click)="deleteMatch(match.id)">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Gestione Giocatori -->
          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Gestione Giocatori</h5>
              <button class="btn btn-primary" (click)="openCreatePlayerModal(createPlayerModal)">
                <i class="bi bi-plus-lg me-2"></i>Nuovo Giocatore
              </button>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Squadra</th>
                      <th>Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let player of players$ | async">
                      <td>{{player.displayName}}</td>
                      <td>{{player.email}}</td>
                      <td>
                        <span *ngIf="player.teamId" class="badge bg-primary">
                          {{getTeamName(player.teamId)}}
                        </span>
                        <span *ngIf="!player.teamId" class="badge bg-secondary">
                          Nessuna squadra
                        </span>
                      </td>
                      <td>
                        <div class="btn-group">
                          <button class="btn btn-sm btn-outline-primary" 
                                  (click)="openAssignTeamModal(player, assignTeamModal)">
                            <i class="bi bi-people"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-danger" 
                                  (click)="deletePlayer(player.uid)">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
            </div>
          </div>
        </div>

          <!-- Gestione Squadre -->
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Gestione Squadre</h5>
              <button class="btn btn-primary" (click)="openCreateTeamModal(createTeamModal)">
                <i class="bi bi-plus-lg me-2"></i>Nuova Squadra
              </button>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Colori</th>
                      <th>Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let team of teams$ | async">
                      <td>{{team.name}}</td>
                      <td>
                        <div class="d-flex gap-2">
                          <div *ngFor="let color of team.colors | teamColors" 
                               class="color-dot" 
                               [style.background-color]="color">
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="btn-group">
                          <button class="btn btn-sm btn-outline-danger" 
                                  (click)="deleteTeam(team.id)">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
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

    <!-- Modal per creare partita -->
    <ng-template #createMatchModal let-modal>
      <div class="modal-header">
        <h4 class="modal-title">Crea Nuova Partita</h4>
        <button type="button" class="btn-close" (click)="modal.dismiss()"></button>
      </div>
      <div class="modal-body">
        <form [formGroup]="matchForm" (ngSubmit)="createMatch()">
          <div class="mb-3">
            <label class="form-label">Squadra Casa</label>
            <select class="form-select" formControlName="homeTeamId">
              <option value="">Seleziona squadra casa</option>
              <option *ngFor="let team of teams$ | async" [value]="team.id">
                {{team.name}}
              </option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Squadra Ospite</label>
            <select class="form-select" formControlName="awayTeamId">
              <option value="">Seleziona squadra ospite</option>
              <option *ngFor="let team of teams$ | async" [value]="team.id">
                {{team.name}}
              </option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Data e Ora</label>
            <input type="datetime-local" 
                   class="form-control" 
                   formControlName="date">
          </div>

          <div class="mb-3">
            <label class="form-label">Giornata</label>
            <input type="number" 
                   class="form-control" 
                   formControlName="matchday" 
                   min="1">
          </div>

          <div class="text-end">
            <button type="button" 
                    class="btn btn-secondary me-2" 
                    (click)="modal.dismiss()">
              Annulla
            </button>
            <button type="submit" 
                    class="btn btn-primary" 
                    [disabled]="!matchForm.valid">
              Crea
            </button>
          </div>
        </form>
      </div>
    </ng-template>

    <!-- Modal per completare partita -->
    <ng-template #completeMatchModal let-modal>
      <div class="modal-header">
        <h4 class="modal-title">Completa Partita</h4>
        <button type="button" class="btn-close" (click)="modal.dismiss()"></button>
      </div>
      <div class="modal-body">
        <form [formGroup]="completeMatchForm" (ngSubmit)="onSubmitCompleteMatch()">
          <div class="mb-3">
            <label class="form-label">Risultato</label>
            <div class="row">
              <div class="col">
                <input type="number" 
                       class="form-control" 
                       formControlName="homeScore" 
                       min="0">
              </div>
              <div class="col-auto d-flex align-items-center">-</div>
              <div class="col">
                <input type="number" 
                       class="form-control" 
                       formControlName="awayScore" 
                       min="0">
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Marcatori</label>
            <div formArrayName="scorers">
              <div *ngFor="let scorer of scorers.controls; let i=index" 
                   [formGroupName]="i" 
                   class="mb-2">
                <div class="row g-2">
                  <div class="col">
                    <select class="form-select" formControlName="playerId">
                      <option value="">Seleziona giocatore</option>
                      <option *ngFor="let player of getMatchPlayers(selectedMatch?.id) | async" 
                              [value]="player.uid">
                        {{player.displayName}}
                      </option>
                    </select>
                  </div>
                  <div class="col-auto">
                    <input type="number" 
                           class="form-control" 
                           formControlName="goals" 
                           min="1">
                  </div>
                  <div class="col-auto">
                    <button type="button" 
                            class="btn btn-outline-danger" 
                            (click)="removeScorer(i)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <button type="button" 
                    class="btn btn-outline-primary mt-2" 
                    (click)="addScorer()">
              <i class="bi bi-plus-lg me-2"></i>Aggiungi Marcatore
            </button>
          </div>

          <div class="mb-3">
            <label class="form-label">Man of the Match</label>
            <select class="form-select" formControlName="motm">
              <option value="">Seleziona MOTM</option>
              <option *ngFor="let player of getMatchPlayers(selectedMatch?.id) | async" 
                      [value]="player.uid">
                {{player.displayName}}
              </option>
            </select>
          </div>

          <div class="text-end">
            <button type="button" 
                    class="btn btn-secondary me-2" 
                    (click)="modal.dismiss()">
              Annulla
            </button>
            <button type="submit" 
                    class="btn btn-primary" 
                    [disabled]="!completeMatchForm.valid">
              Salva
            </button>
          </div>
        </form>
      </div>
    </ng-template>

    <!-- Modal per assegnare squadra -->
    <ng-template #assignTeamModal let-modal>
      <div class="modal-header">
        <h4 class="modal-title">Assegna Squadra</h4>
        <button type="button" class="btn-close" (click)="modal.dismiss()"></button>
      </div>
      <div class="modal-body">
        <form [formGroup]="assignTeamForm" (ngSubmit)="assignTeam()">
          <div class="mb-3">
            <label class="form-label">Squadra</label>
            <select class="form-select" formControlName="teamId">
              <option value="">Seleziona squadra</option>
              <option *ngFor="let team of teams$ | async" [value]="team.id">
                {{team.name}}
              </option>
            </select>
          </div>

          <div class="text-end">
            <button type="button" 
                    class="btn btn-secondary me-2" 
                    (click)="modal.dismiss()">
              Annulla
            </button>
            <button type="submit" 
                    class="btn btn-primary" 
                    [disabled]="!assignTeamForm.valid">
              Salva
            </button>
          </div>
        </form>
      </div>
    </ng-template>

    <!-- Modal per creare giocatore -->
    <ng-template #createPlayerModal let-modal>
      <div class="modal-header">
        <h4 class="modal-title">Crea Nuovo Giocatore</h4>
        <button type="button" class="btn-close" (click)="modal.dismiss()"></button>
      </div>
      <div class="modal-body">
        <form [formGroup]="playerForm" (ngSubmit)="createPlayer()">
          <div class="mb-3">
            <label class="form-label">Nome</label>
            <input type="text" 
                   class="form-control" 
                   formControlName="displayName">
          </div>

          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" 
                   class="form-control" 
                   formControlName="email">
          </div>

          <div class="mb-3">
            <label class="form-label">Password</label>
            <input type="password" 
                   class="form-control" 
                   formControlName="password">
          </div>

          <div class="text-end">
            <button type="button" 
                    class="btn btn-secondary me-2" 
                    (click)="modal.dismiss()">
              Annulla
            </button>
            <button type="submit" 
                    class="btn btn-primary" 
                    [disabled]="!playerForm.valid">
              Crea
            </button>
          </div>
        </form>
      </div>
    </ng-template>

    <!-- Modal per creare squadra -->
    <ng-template #createTeamModal let-modal>
      <div class="modal-header">
        <h4 class="modal-title">Crea Nuova Squadra</h4>
        <button type="button" class="btn-close" (click)="modal.dismiss()"></button>
      </div>
      <div class="modal-body">
        <form [formGroup]="teamForm" (ngSubmit)="createTeam()">
          <div class="mb-3">
            <label class="form-label">Nome Squadra</label>
            <input type="text" 
                   class="form-control" 
                   formControlName="name">
          </div>

          <div class="mb-3">
            <label class="form-label">Colori (separati da virgola)</label>
            <input type="text" 
                   class="form-control" 
                   formControlName="colors" 
                   placeholder="es: rosso, blu, bianco">
          </div>

          <div class="mb-3">
            <label class="form-label">Logo URL</label>
            <input type="text" 
                   class="form-control" 
                   formControlName="logo">
          </div>

          <div class="text-end">
            <button type="button" 
                    class="btn btn-secondary me-2" 
                    (click)="modal.dismiss()">
              Annulla
            </button>
            <button type="submit" 
                    class="btn btn-primary" 
                    [disabled]="!teamForm.valid">
              Crea
            </button>
          </div>
        </form>
      </div>
    </ng-template>
  `,
  styles: [`
    :host {
      --primary-color: #4f46e5;
      --primary-hover: #4338ca;
      --secondary-color: #64748b;
      --success-color: #22c55e;
      --danger-color: #ef4444;
      --warning-color: #f59e0b;
      --info-color: #3b82f6;
      --light-color: #f8fafc;
      --dark-color: #1e293b;
      --border-color: #e2e8f0;
    }

    .card {
      border: none;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
      background: white;
      border-radius: 0.75rem;
      overflow: hidden;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }
    }

    .card-header {
      background: var(--light-color);
      border-bottom: 1px solid var(--border-color);
      padding: 1rem 1.5rem;

      h5 {
        color: var(--dark-color);
        font-weight: 600;
        margin: 0;
      }
    }

    .list-group-item {
      border: none;
      padding: 1rem 1.5rem;
      color: var(--secondary-color);
      transition: all 0.2s;

      &:hover {
        background: var(--light-color);
        color: var(--primary-color);
      }

      &.active {
        background: var(--primary-color);
        color: white;
      }
    }

    .btn {
      border-radius: 0.5rem;
      padding: 0.5rem 1rem;
      font-weight: 500;
      transition: all 0.2s;

      &-primary {
        background: var(--primary-color);
        border-color: var(--primary-color);

        &:hover {
          background: var(--primary-hover);
          border-color: var(--primary-hover);
        }
      }

      &-outline-primary {
        color: var(--primary-color);
        border-color: var(--primary-color);

        &:hover {
          background: var(--primary-color);
          color: white;
        }
      }

      &-outline-danger {
        color: var(--danger-color);
        border-color: var(--danger-color);

        &:hover {
          background: var(--danger-color);
          color: white;
        }
      }
    }

    .table {
      margin: 0;

      th {
        font-weight: 600;
        color: var(--secondary-color);
        border-bottom: 2px solid var(--border-color);
        padding: 1rem;
      }

      td {
        padding: 1rem;
        vertical-align: middle;
        border-bottom: 1px solid var(--border-color);
      }

      tr:hover {
        background: var(--light-color);
      }
    }

    .badge {
      padding: 0.5em 0.75em;
      font-weight: 500;
      border-radius: 0.5rem;

      &.bg-success {
        background: var(--success-color) !important;
      }

      &.bg-primary {
        background: var(--primary-color) !important;
      }

      &.bg-secondary {
        background: var(--secondary-color) !important;
      }
    }

    .color-dot {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .modal-content {
      border: none;
      border-radius: 0.75rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .modal-header {
      background: var(--light-color);
      border-bottom: 1px solid var(--border-color);
      padding: 1rem 1.5rem;
      border-radius: 0.75rem 0.75rem 0 0;

      h4 {
        color: var(--dark-color);
        font-weight: 600;
        margin: 0;
      }
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-control, .form-select {
      border-radius: 0.5rem;
      border: 1px solid var(--border-color);
      padding: 0.5rem 1rem;
      transition: all 0.2s;

      &:focus {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
      }
    }

    .form-label {
      color: var(--secondary-color);
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
  `]
})
export class AdminPanelComponent implements OnInit {
  private authService = inject(AuthService);
  private playerService = inject(PlayerService);
  private teamService = inject(TeamService);
  private matchService = inject(MatchService);
  private formBuilder = inject(FormBuilder);
  public modalService = inject(NgbModal);
  private notificationService = inject(NotificationService);

  isAdmin$: Observable<boolean>;
  players$: Observable<User[]>;
  teams$: Observable<Team[]>;
  matches$: Observable<Match[]>;
  matchesByMatchday$: Observable<{ [key: number]: Match[] }>;
  teamNames: { [key: string]: string } = {};
  playerForm: FormGroup;
  teamForm: FormGroup;
  matchForm: FormGroup;
  assignTeamForm: FormGroup;
  completeMatchForm: FormGroup;
  selectedPlayer: User | null = null;
  selectedMatch: Match | null = null;
  matchPlayers$: { [key: string]: Observable<User[]> } = {};

  constructor() {
    this.isAdmin$ = this.authService.isAdmin();
    this.players$ = this.playerService.getPlayers();
    this.teams$ = this.teamService.getTeams();
    this.matches$ = this.matchService.getMatches();
    this.matchesByMatchday$ = this.matchService.getMatchesByMatchday();
    
    // Carica i nomi delle squadre
    this.teams$.subscribe(teams => {
      teams.forEach(team => {
        this.teamNames[team.id] = team.name;
      });
    });

    this.playerForm = this.formBuilder.group({
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.teamForm = this.formBuilder.group({
      name: ['', Validators.required],
      colors: ['', Validators.required],
      logo: ['', Validators.required]
    });

    this.matchForm = this.formBuilder.group({
      homeTeamId: ['', Validators.required],
      awayTeamId: ['', Validators.required],
      date: ['', Validators.required],
      matchday: [1, [Validators.required, Validators.min(1)]]
    });

    this.assignTeamForm = this.formBuilder.group({
      teamId: ['', Validators.required]
    });

    this.completeMatchForm = this.formBuilder.group({
      homeScore: [0, [Validators.required, Validators.min(0)]],
      awayScore: [0, [Validators.required, Validators.min(0)]],
      scorers: this.formBuilder.array([]),
      motm: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadMatchPlayers();
  }

  loadMatchPlayers(): void {
    this.matches$.subscribe(matches => {
      matches.forEach(match => {
        if (!this.matchPlayers$[match.id]) {
          this.matchPlayers$[match.id] = combineLatest([
            this.playerService.getPlayersByTeam(match.homeTeamId),
            this.playerService.getPlayersByTeam(match.awayTeamId)
          ]).pipe(
            map(([homePlayers, awayPlayers]) => [...homePlayers, ...awayPlayers])
          );
        }
      });
    });
  }

  getMatchPlayers(matchId: string | undefined): Observable<User[]> {
    if (!matchId) return of([]);
    return this.matchPlayers$[matchId] || of([]);
  }

  openCreateMatchModal(content: any): void {
    this.matchForm.reset();
    this.modalService.open(content);
  }

  openCreatePlayerModal(content: any): void {
    this.playerForm.reset();
    this.modalService.open(content);
  }

  openCreateTeamModal(content: any): void {
    this.teamForm.reset();
    this.modalService.open(content);
  }

  createMatch(): void {
    if (this.matchForm.valid) {
      const { homeTeamId, awayTeamId, date, matchday } = this.matchForm.value;
      const matchDateTime = new Date(date);
      
      this.matchService.createMatch({
        date: matchDateTime,
        homeTeamId,
        awayTeamId,
        completed: false,
        homeScore: 0,
        awayScore: 0,
        scorers: {},
        matchday
      })
        .then(() => {
          this.matchForm.reset();
          this.modalService.dismissAll();
          this.notificationService.success('Partita creata con successo');
        })
        .catch((error: Error) => {
          console.error('Errore nella creazione della partita:', error);
          this.notificationService.error('Errore nella creazione della partita');
        });
    }
  }

  deleteMatch(id: string): void {
    if (confirm('Sei sicuro di voler eliminare questa partita?')) {
      this.matchService.deleteMatch(id)
        .catch((error: Error) => {
          console.error('Errore nell\'eliminazione della partita:', error);
        });
    }
  }

  openCompleteMatchModal(match: Match, content: any): void {
    this.selectedMatch = match;
    if (!this.matchPlayers$[match.id]) {
      this.matchPlayers$[match.id] = combineLatest([
        this.playerService.getPlayersByTeam(match.homeTeamId),
        this.playerService.getPlayersByTeam(match.awayTeamId)
      ]).pipe(
        map(([homePlayers, awayPlayers]) => [...homePlayers, ...awayPlayers])
      );
    }

    // Se la partita è già completata, pre-compila il form
    if (match.completed) {
      const scorers = Object.entries(match.scorers || {}).map(([playerId, goals]) => ({
        playerId,
        goals
      }));

      this.completeMatchForm.reset({
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        scorers: scorers,
        motm: match.motm || ''
      });
    } else {
      this.completeMatchForm.reset({
        homeScore: 0,
        awayScore: 0,
        scorers: [],
        motm: ''
      });
    }
    this.modalService.open(content);
  }

  onSubmitCompleteMatch(): void {
    if (this.completeMatchForm.valid && this.selectedMatch) {
      const formValue = this.completeMatchForm.value;
      const scorers: Record<string, number> = {};
      
      // Converti l'array dei marcatori in un oggetto
      formValue.scorers.forEach((scorer: any) => {
        if (scorer.playerId && scorer.goals > 0) {
          scorers[scorer.playerId] = scorer.goals;
        }
      });

      // Usa updateMatch se la partita è già completata, altrimenti completeMatch
      const promise = this.selectedMatch.completed
        ? this.matchService.updateMatch(
            this.selectedMatch.id,
            formValue.homeScore,
            formValue.awayScore,
            scorers,
            formValue.motm
          )
        : this.matchService.completeMatch(
            this.selectedMatch.id,
            formValue.homeScore,
            formValue.awayScore,
            scorers,
            formValue.motm
          );

      promise
        .then(() => {
          this.modalService.dismissAll();
          this.notificationService.success('Partita aggiornata con successo');
        })
        .catch(error => {
          console.error('Errore durante l\'aggiornamento della partita:', error);
          this.notificationService.error('Errore durante l\'aggiornamento della partita');
        });
    }
  }

  get scorers() {
    return this.completeMatchForm.get('scorers') as FormArray;
  }

  addScorer(): void {
    const scorerForm = this.formBuilder.group({
      playerId: ['', Validators.required],
      goals: [1, [Validators.required, Validators.min(1)]]
    });
    this.scorers.push(scorerForm);
  }

  removeScorer(index: number): void {
    this.scorers.removeAt(index);
  }

  getTeamName(teamId: string): string {
    return this.teamNames[teamId] || 'Squadra non trovata';
  }

  createPlayer(): void {
    if (this.playerForm.valid) {
      const { displayName, email, password } = this.playerForm.value;
      this.authService.register(email, password, displayName)
        .then(() => {
          this.playerForm.reset();
          this.modalService.dismissAll();
        })
        .catch((error: Error) => {
          console.error('Errore nella creazione del giocatore:', error);
        });
    }
  }

  deletePlayer(uid: string): void {
    if (confirm('Sei sicuro di voler eliminare questo giocatore?')) {
      this.playerService.deletePlayer(uid)
        .catch((error: Error) => {
          console.error('Errore nell\'eliminazione del giocatore:', error);
        });
    }
  }

  createTeam(): void {
    if (this.teamForm.valid) {
      const team = {
        ...this.teamForm.value,
        colors: this.teamForm.value.colors.split(',').map((c: string) => c.trim()),
        players: []
      };
      this.teamService.createTeam(team)
        .then(() => {
          this.teamForm.reset();
          this.modalService.dismissAll();
        })
        .catch((error: Error) => {
          console.error('Errore nella creazione della squadra:', error);
        });
    }
  }

  deleteTeam(id: string | undefined): void {
    if (!id) return;
    if (confirm('Sei sicuro di voler eliminare questa squadra?')) {
      this.teamService.deleteTeam(id)
        .catch((error: Error) => {
          console.error('Errore nell\'eliminazione della squadra:', error);
        });
    }
  }

  openAssignTeamModal(player: User, content: any): void {
    this.selectedPlayer = player;
    this.modalService.open(content);
  }

  assignTeam(): void {
    if (this.assignTeamForm.valid && this.selectedPlayer) {
      const { teamId } = this.assignTeamForm.value;
      this.playerService.assignTeam(this.selectedPlayer.uid, teamId)
        .then(() => {
          this.modalService.dismissAll();
          this.assignTeamForm.reset();
        })
        .catch((error: Error) => {
          console.error('Errore nell\'assegnazione della squadra:', error);
        });
    }
  }

  removeFromTeam(player: User): void {
    if (player.teamId) {
      this.playerService.removeFromTeam(player.uid)
        .catch((error: Error) => {
          console.error('Errore nella rimozione dalla squadra:', error);
        });
    }
  }

  getMatchdays(matchesByMatchday: { [key: number]: Match[] }): number[] {
    return Object.keys(matchesByMatchday)
      .map(Number)
      .sort((a, b) => a - b);
  }
} 