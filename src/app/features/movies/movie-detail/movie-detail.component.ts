import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MovieService } from '../../../core/services/movie.service';
import { RatingPipe } from '../../../shared/pipes/rating.pipe';
import { ReleaseYearPipe } from '../../../shared/pipes/release-year.pipe';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [RouterLink, RatingPipe, ReleaseYearPipe],
  templateUrl: './movie-detail.component.html',
  styleUrl: './movie-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieDetailComponent {
  private readonly movieService = inject(MovieService);

  /** Vinculado automáticamente al parámetro ':id' de la ruta. */
  readonly id = input.required<string>();

  readonly movieResource = rxResource({
    params: () => Number(this.id()),
    stream: ({ params }) => this.movieService.getById(params),
  });
}
