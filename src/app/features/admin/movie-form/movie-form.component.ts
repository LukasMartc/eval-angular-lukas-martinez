import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { blockFutureYear } from '../../../core/validators/block-future-year.validator';
import {
  AGE_RATINGS_BY_GENRE,
  MOVIE_GENRE_OPTIONS,
  Movie,
  MovieAgeRating,
  MovieGenre,
} from '../../../core/models/movie.model';
import { MovieService } from '../../../core/services/movie.service';

@Component({
  selector: 'app-movie-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './movie-form.component.html',
  styleUrl: './movie-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly movieService = inject(MovieService);
  private readonly router = inject(Router);

  /** Vinculado automáticamente al parámetro ':id' cuando la ruta es /admin/edit/:id. */
  readonly id = input<string>();

  readonly genreOptions = MOVIE_GENRE_OPTIONS;
  readonly isSaving = signal(false);
  readonly savedMessage = signal<string | null>(null);
  readonly posterPreview = signal<string | null>(null);

  readonly isEditMode = computed(() => !!this.id());

  readonly movieResource = rxResource({
    params: () => (this.id() ? Number(this.id()) : undefined),
    stream: ({ params }) => this.movieService.getById(params!),
  });

  readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    releaseYear: [new Date().getFullYear(), [Validators.required, blockFutureYear]],
    genre: ['' as MovieGenre | '', [Validators.required]],
    ageRating: ['' as MovieAgeRating | '', [Validators.required]],
    synopsis: ['', [Validators.required, Validators.minLength(10)]],
    posterUrl: ['', [Validators.required]],
    rating: [5, [Validators.required, Validators.min(0), Validators.max(10)]],
    isFeatured: [false],
    castLineup: this.formBuilder.array<FormControl<string>>([
      this.formBuilder.nonNullable.control('', Validators.required),
    ]),
  });

  private readonly genreValue = signal(this.form.controls.genre.value);

  readonly ageRatingOptions = computed<MovieAgeRating[]>(() => {
    const genre = this.genreValue();
    return genre ? AGE_RATINGS_BY_GENRE[genre as MovieGenre] : [];
  });

  get castLineup(): FormArray<FormControl<string>> {
    return this.form.controls.castLineup;
  }

  constructor() {
    this.form.controls.genre.valueChanges.subscribe((genre) => this.genreValue.set(genre));

    // Selectores dependientes: si la clasificación actual ya no aplica al nuevo género, se limpia.
    effect(() => {
      const options = this.ageRatingOptions();
      const current = this.form.controls.ageRating.value;
      if (current && !options.includes(current as MovieAgeRating)) {
        this.form.controls.ageRating.setValue('');
      }
    });

    effect(() => {
      const movie = this.movieResource.value();
      if (movie) {
        this.patchFormWithMovie(movie);
      }
    });
  }

  addCastMember(): void {
    this.castLineup.push(this.formBuilder.nonNullable.control('', Validators.required));
  }

  removeCastMember(index: number): void {
    if (this.castLineup.length > 1) {
      this.castLineup.removeAt(index);
    }
  }

  onPosterSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.posterPreview.set(dataUrl);
      this.form.controls.posterUrl.setValue(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  onPosterUrlChange(): void {
    this.posterPreview.set(this.form.controls.posterUrl.value || null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const raw = this.form.getRawValue();
    const draft: Omit<Movie, 'id'> = {
      title: raw.title,
      releaseYear: raw.releaseYear,
      genre: raw.genre as MovieGenre,
      ageRating: raw.ageRating as MovieAgeRating,
      synopsis: raw.synopsis,
      posterUrl: raw.posterUrl,
      rating: raw.rating,
      isFeatured: raw.isFeatured,
      cast: raw.castLineup.filter((actor: string) => !!actor.trim()),
    };

    const currentId = this.id();
    const request$ = currentId
      ? this.movieService.update(Number(currentId), { id: Number(currentId), ...draft })
      : this.movieService.create(draft);

    request$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.savedMessage.set('Ficha guardada en bóveda');
        setTimeout(() => this.router.navigate(['/admin']), 1200);
      },
      error: () => {
        this.isSaving.set(false);
      },
    });
  }

  private patchFormWithMovie(movie: Movie): void {
    this.form.patchValue({
      title: movie.title,
      releaseYear: movie.releaseYear,
      genre: movie.genre,
      ageRating: movie.ageRating,
      synopsis: movie.synopsis,
      posterUrl: movie.posterUrl,
      rating: movie.rating,
      isFeatured: movie.isFeatured,
    });
    this.genreValue.set(movie.genre);
    this.posterPreview.set(movie.posterUrl);

    this.castLineup.clear();
    const cast = movie.cast.length ? movie.cast : [''];
    cast.forEach((actor) => this.castLineup.push(this.formBuilder.nonNullable.control(actor, Validators.required)));
  }
}
