import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { MovieService } from '../core/services/movie.service';
import { UiStateService } from '../core/services/ui-state.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, AsyncPipe],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent implements OnInit, OnDestroy {
  private readonly movieService = inject(MovieService);
  private readonly authService = inject(AuthService);
  private readonly uiState = inject(UiStateService);
  private readonly router = inject(Router);

  private moviesSubscription?: Subscription;

  readonly currentUser$ = this.authService.currentUser$;
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly layoutMode = this.uiState.layoutMode;

  /** Cantidad de películas destacadas actualmente cargadas en el catálogo. */
  readonly spotlightTally = computed(() => this.movieService.loadedMovies().filter((movie) => movie.isFeatured).length);

  constructor() {
    effect(() => {
      // Se dispara con cada cambio de modo de vista o de destacadas cargadas.
      this.layoutMode();
      this.spotlightTally();
      console.log('AUDIT::render-cycle');
    });
  }

  ngOnInit(): void {
    this.moviesSubscription = this.movieService.getAll().subscribe();
  }

  ngOnDestroy(): void {
    this.moviesSubscription?.unsubscribe();
  }

  toggleLayoutMode(): void {
    this.uiState.toggleLayoutMode();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
