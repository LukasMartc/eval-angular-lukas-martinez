export type MovieGenre = 'accion' | 'comedia' | 'drama' | 'terror' | 'ciencia-ficcion' | 'animacion';

export type MovieAgeRating = 'ATP' | '+7' | '+13' | '+16' | '+18';

export interface Movie {
  id: number;
  title: string;
  releaseYear: number;
  genre: MovieGenre;
  ageRating: MovieAgeRating;
  synopsis: string;
  posterUrl: string;
  rating: number;
  isFeatured: boolean;
  cast: string[];
}

export type MovieDraft = Omit<Movie, 'id'>;

export const MOVIE_GENRE_OPTIONS: { value: MovieGenre; label: string }[] = [
  { value: 'accion', label: 'Acción' },
  { value: 'comedia', label: 'Comedia' },
  { value: 'drama', label: 'Drama' },
  { value: 'terror', label: 'Terror' },
  { value: 'ciencia-ficcion', label: 'Ciencia ficción' },
  { value: 'animacion', label: 'Animación' },
];

/** El género elegido determina qué clasificaciones de edad están disponibles (selectores dependientes). */
export const AGE_RATINGS_BY_GENRE: Record<MovieGenre, MovieAgeRating[]> = {
  accion: ['+13', '+16', '+18'],
  comedia: ['ATP', '+7', '+13'],
  drama: ['+13', '+16'],
  terror: ['+16', '+18'],
  'ciencia-ficcion': ['+7', '+13', '+16'],
  animacion: ['ATP', '+7'],
};
