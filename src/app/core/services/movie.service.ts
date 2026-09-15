import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Movie, MovieDraft } from '../models/movie.model';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/movies`;

  /** Última lista de películas cargada; alimenta el spotlightTally del layout. */
  readonly loadedMovies = signal<Movie[]>([]);

  getAll(): Observable<Movie[]> {
    return this.http.get<Movie[]>(this.baseUrl).pipe(tap((movies) => this.loadedMovies.set(movies)));
  }

  getById(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.baseUrl}/${id}`);
  }

  create(draft: MovieDraft): Observable<Movie> {
    return this.http.post<Movie>(this.baseUrl, draft);
  }

  update(id: number, movie: Movie): Observable<Movie> {
    return this.http.put<Movie>(`${this.baseUrl}/${id}`, movie);
  }

  /** Elimina una película del catálogo. */
  discardMovie(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.loadedMovies.update((movies) => movies.filter((movie) => movie.id !== id))),
    );
  }
}
