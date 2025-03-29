import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const AdminGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.isAdmin().pipe(
    map(isAdmin => {
      if (isAdmin) {
        return true;
      }
      router.navigate(['/home']);
      return false;
    })
  );
}; 