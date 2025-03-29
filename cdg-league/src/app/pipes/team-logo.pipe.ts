import { Pipe, PipeTransform } from '@angular/core';
import { Team } from '../models/team.model';

@Pipe({
  name: 'teamLogo',
  standalone: true
})
export class TeamLogoPipe implements PipeTransform {
  transform(team: Team | null): string {
    return team?.logo || 'assets/default-team-logo.png';
  }
} 