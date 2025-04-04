import { Component, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Team } from '../../models/team.model';
import { TeamService } from '../../services/team.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-standings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './standings.component.html',
  styleUrls: ['./standings.component.scss']
})
export class StandingsComponent implements OnInit {
  teams$!: Observable<Team[]>;

  constructor(private teamService: TeamService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.teams$ = this.teamService.getTeams().pipe(
      map(teams => teams.sort((a, b) => {
        // Confronto per punti
        const pointsDiff = (b.points || 0) - (a.points || 0);
        if (pointsDiff !== 0) {
          return pointsDiff; // Se i punti sono diversi, usa questo ordinamento
        }
        // Confronto per differenza reti (goal fatti - goal subiti)
        const goalDiffA = (a.goalsFor || 0) - (a.goalsAgainst || 0);
        const goalDiffB = (b.goalsFor || 0) - (b.goalsAgainst || 0);
        return goalDiffB - goalDiffA; // Ordina in base alla differenza reti
      }))
    );
}
  getPositionClass(position: number): string {
    if (position === 1) return 'first';
    if (position === 2) return 'second';
    if (position === 3) return 'third';
    return '';
  }
}
