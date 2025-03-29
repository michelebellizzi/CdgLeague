import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  error: string = '';
  isLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Se l'utente è già autenticato, reindirizza alla home
    this.authService.isAuthenticated().subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.authService.isAdmin().subscribe(isAdmin => {
          if (isAdmin) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/home']);
          }
        });
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = '';
      const { email, password } = this.loginForm.value;
      
      this.authService.login(email, password)
        .then(() => {
          this.authService.isAdmin().subscribe(isAdmin => {
            if (isAdmin) {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/home']);
            }
          });
        })
        .catch((error: Error) => {
          console.error('Errore di login:', error);
          this.error = 'Credenziali non valide. Riprova.';
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }
} 