import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  error: string = '';
  loading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = '';
      
      const { email, password, displayName } = this.registerForm.value;
      
      this.authService.register(email, password, displayName)
        .then(() => {
          this.router.navigate(['/login']);
        })
        .catch(error => {
          switch (error.code) {
            case 'auth/email-already-in-use':
              this.error = 'Questa email è già registrata. Usa un\'altra email o effettua il login.';
              break;
            case 'auth/invalid-email':
              this.error = 'L\'email inserita non è valida.';
              break;
            case 'auth/operation-not-allowed':
              this.error = 'La registrazione con email e password non è abilitata. Contatta l\'amministratore.';
              break;
            case 'auth/weak-password':
              this.error = 'La password è troppo debole. Usa una password più lunga.';
              break;
            default:
              this.error = 'Errore durante la registrazione. Riprova.';
          }
          console.error('Errore di registrazione:', error);
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
} 