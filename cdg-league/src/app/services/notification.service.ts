import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  success(message: string): void {
    alert(message);
  }

  error(message: string): void {
    alert('Errore: ' + message);
  }
} 