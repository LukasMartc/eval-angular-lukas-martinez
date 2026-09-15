import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'appRating' })
export class RatingPipe implements PipeTransform {
  transform(rating: number | null | undefined): string {
    if (rating === null || rating === undefined) {
      return 'Sin calificar';
    }
    const rounded = this.roundHalf(rating);
    return `${rounded.toFixed(1)} / 10`;
  }

  /** Redondea la calificación al medio punto más cercano (p. ej. 7.7 -> 7.5). */
  private roundHalf(value: number): number {
    return Math.round(value * 2) / 2;
  }
}
