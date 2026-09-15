import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'appReleaseYear' })
export class ReleaseYearPipe implements PipeTransform {
  transform(year: number | null | undefined): string {
    if (!year) {
      return 'Año desconocido';
    }
    return `Estreno: ${year}`;
  }
}
