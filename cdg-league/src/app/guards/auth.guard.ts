import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const AuthGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.getCurrentUser().pipe(
    map(user => {
      if (user) {
        return true;
      }
      router.navigate(['/login']);
      return false;
    })
  );
}; 