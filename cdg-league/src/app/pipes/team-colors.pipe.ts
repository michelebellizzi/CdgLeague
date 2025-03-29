import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'teamColors',
  standalone: true
})
export class TeamColorsPipe implements PipeTransform {
  transform(colors: string | string[] | undefined | null): string[] {
    if (!colors) return [];
    if (typeof colors === 'string') {
      return colors.split(',').map(c => c.trim());
    }
    return colors;
  }
} 