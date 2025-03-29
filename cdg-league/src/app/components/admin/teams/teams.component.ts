import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TeamService } from '../../../services/team.service';
import { Team } from '../../../models/team.model';
import { Observable } from 'rxjs';
import { TeamColorsPipe } from '../../../pipes/team-colors.pipe';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TeamColorsPipe],
  template: `
    <div class="container mt-4">
      <h2>Gestione Squadre</h2>

      <!-- Form per creare una nuova squadra -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Crea Nuova Squadra</h5>
          <form [formGroup]="teamForm" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label for="name" class="form-label">Nome Squadra</label>
              <input type="text" class="form-control" id="name" formControlName="name">
            </div>
            <div class="mb-3">
              <label for="colors" class="form-label">Colori (separati da virgola)</label>
              <input type="text" class="form-control" id="colors" formControlName="colors">
            </div>
            <div class="mb-3">
              <label for="logo" class="form-label">URL Logo</label>
              <input type="text" class="form-control" id="logo" formControlName="logo">
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="!teamForm.valid">Crea Squadra</button>
          </form>
        </div>
      </div>

      <!-- Lista delle squadre -->
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Squadre Esistenti</h5>
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
                  <td>{{ team.name }}</td>
                  <td>
                    <span *ngFor="let color of (team.colors | teamColors)"
                          class="badge me-1" 
                          [style.background-color]="color">
                      {{ color }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-danger btn-sm" (click)="deleteTeam(team.id)">
                      Elimina
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .badge {
      width: 20px;
      height: 20px;
      display: inline-block;
    }
  `]
})
export class TeamsComponent implements OnInit {
  teamForm: FormGroup;
  teams$: Observable<Team[]>;

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService
  ) {
    this.teamForm = this.fb.group({
      name: ['', Validators.required],
      colors: ['', Validators.required],
      logo: ['', Validators.required]
    });
    this.teams$ = this.teamService.getTeams();
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.teamForm.valid) {
      const team = {
        ...this.teamForm.value,
        colors: this.teamForm.value.colors.split(',').map((c: string) => c.trim()),
        players: []
      };
      this.teamService.createTeam(team)
        .then(() => {
          this.teamForm.reset();
        })
        .catch(error => {
          console.error('Errore nella creazione della squadra:', error);
        });
    }
  }

  deleteTeam(id: string): void {
    if (confirm('Sei sicuro di voler eliminare questa squadra?')) {
      this.teamService.deleteTeam(id)
        .catch((error: Error) => {
          console.error('Errore nell\'eliminazione della squadra:', error);
        });
    }
  }
} 