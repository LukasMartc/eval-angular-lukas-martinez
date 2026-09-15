import { ChangeDetectionStrategy, Component, computed, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { rxResource } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { MovieService } from '../../../core/services/movie.service';
import { SEARCH_DEBOUNCE_MS, SearchHistoryService } from '../../../core/services/search-history.service';
import { UiStateService } from '../../../core/services/ui-state.service';
import { ReelCardComponent } from '../../../shared/components/reel-card/reel-card.component';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [ReactiveFormsModule, ReelCardComponent],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieListComponent {
  private readonly movieService = inject(MovieService);
  private readonly searchHistoryService = inject(SearchHistoryService);
  private readonly uiState = inject(UiStateService);
  private readonly authService = inject(AuthService);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly history = this.searchHistoryService.history;
  readonly layoutMode = this.uiState.layoutMode;
  readonly isAuthenticated = this.authService.isAuthenticated;

  private readonly searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(startWith(''), debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged()),
    { initialValue: '' },
  );

  readonly moviesResource = rxResource({
    stream: () => this.movieService.getAll(),
  });

  readonly filteredMovies = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const movies = this.moviesResource.value() ?? [];
    return term ? movies.filter((movie) => movie.title.toLowerCase().includes(term)) : movies;
  });

  constructor() {
    effect(() => {
      const term = this.searchTerm().trim();
      if (term) {
        // `add()` reads y escribe la señal `history`; sin `untracked` el efecto
        // quedaría suscrito a su propia escritura y se dispararía sin fin.
        untracked(() => this.searchHistoryService.add(term));
      }
    });
  }

  applyHistoryTerm(term: string): void {
    this.searchControl.setValue(term);
  }

  clearHistory(): void {
    this.searchHistoryService.clear();
  }

  onToggleFeatured(movieId: number): void {
    const movie = (this.moviesResource.value() ?? []).find((item) => item.id === movieId);
    if (!movie) {
      return;
    }
    this.movieService.update(movieId, { ...movie, isFeatured: !movie.isFeatured }).subscribe(() => {
      this.moviesResource.reload();
    });
  }
}
