import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mt-4">
      <h2>Gestione Utenti</h2>

      <!-- Form per creare un nuovo utente -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Crea Nuovo Utente</h5>
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label for="displayName" class="form-label">Nome Visualizzato</label>
              <input type="text" class="form-control" id="displayName" formControlName="displayName">
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input type="email" class="form-control" id="email" formControlName="email">
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input type="password" class="form-control" id="password" formControlName="password">
            </div>
            <div class="mb-3 form-check">
              <input type="checkbox" class="form-check-input" id="isAdmin" formControlName="isAdmin">
              <label class="form-check-label" for="isAdmin">Amministratore</label>
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="!userForm.valid">Crea Utente</button>
          </form>
        </div>
      </div>

      <!-- Lista degli utenti -->
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Utenti Esistenti</h5>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Ruolo</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of users$ | async">
                  <td>{{ user.displayName }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span class="badge" [ngClass]="user.isAdmin ? 'bg-danger' : 'bg-primary'">
                      {{ user.isAdmin ? 'Admin' : 'Utente' }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-danger btn-sm" (click)="deleteUser(user.uid)">
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
  `
})
export class UsersComponent implements OnInit {
  userForm: FormGroup;
  users$: Observable<User[]>;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.userForm = this.fb.group({
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      isAdmin: [false]
    });
    this.users$ = this.authService.getUsers();
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.userForm.valid) {
      const { email, password, displayName, isAdmin } = this.userForm.value;
      if (isAdmin) {
        this.authService.createAdmin(email, password, displayName)
          .then(() => {
            this.userForm.reset();
          })
          .catch(error => {
            console.error('Errore nella creazione dell\'amministratore:', error);
          });
      } else {
        this.authService.register(email, password, displayName)
          .then(() => {
            this.userForm.reset();
          })
          .catch(error => {
            console.error('Errore nella creazione dell\'utente:', error);
          });
      }
    }
  }

  deleteUser(uid: string): void {
    if (confirm('Sei sicuro di voler eliminare questo utente?')) {
      this.authService.deleteUser(uid)
        .catch(error => {
          console.error('Errore nell\'eliminazione dell\'utente:', error);
        });
    }
  }
} 