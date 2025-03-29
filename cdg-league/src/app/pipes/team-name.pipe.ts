import { Pipe, PipeTransform } from '@angular/core';
import { Team } from '../models/team.model';

@Pipe({
  name: 'teamName',
  standalone: true
})
export class TeamNamePipe implements PipeTransform {
  transform(team: Team | null): string {
    return team?.name || 'Squadra Sconosciuta';
  }
} 