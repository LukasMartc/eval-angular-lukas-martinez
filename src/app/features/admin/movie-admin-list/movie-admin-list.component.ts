import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MovieService } from '../../../core/services/movie.service';
import { ReelCardComponent } from '../../../shared/components/reel-card/reel-card.component';

@Component({
  selector: 'app-movie-admin-list',
  standalone: true,
  imports: [RouterLink, ReelCardComponent],
  templateUrl: './movie-admin-list.component.html',
  styleUrl: './movie-admin-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieAdminListComponent {
  private readonly movieService = inject(MovieService);

  readonly moviesResource = rxResource({
    stream: () => this.movieService.getAll(),
  });

  /** Elimina una película del catálogo y refresca el listado de administración. */
  discardMovie(id: number): void {
    if (!confirm('¿Eliminar esta película del catálogo?')) {
      return;
    }
    this.movieService.discardMovie(id).subscribe(() => this.moviesResource.reload());
  }
}
