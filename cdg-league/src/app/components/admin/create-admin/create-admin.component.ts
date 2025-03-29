import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-admin.component.html',
  styleUrls: ['./create-admin.component.scss']
})
export class CreateAdminComponent implements OnInit {
  adminForm: FormGroup;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.adminForm = this.formBuilder.group({
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.adminForm.valid) {
      const { displayName, email, password } = this.adminForm.value;
      this.authService.createAdmin(email, password, displayName)
        .then(() => {
          this.success = 'Admin creato con successo!';
          this.error = null;
          this.adminForm.reset();
        })
        .catch(error => {
          this.error = error.message;
          this.success = null;
        });
    }
  }
} 