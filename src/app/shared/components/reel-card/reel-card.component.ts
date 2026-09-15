import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Movie } from '../../../core/models/movie.model';
import { RatingPipe } from '../../pipes/rating.pipe';
import { ReleaseYearPipe } from '../../pipes/release-year.pipe';
import { TitleEllipsisPipe } from '../../pipes/title-ellipsis.pipe';

@Component({
  selector: 'app-reel-card',
  standalone: true,
  imports: [RouterLink, RatingPipe, ReleaseYearPipe, TitleEllipsisPipe],
  templateUrl: './reel-card.component.html',
  styleUrl: './reel-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReelCardComponent {
  readonly movie = input.required<Movie>();
  readonly compact = input(false);
  readonly canManage = input(false);

  readonly toggleFeatured = output<number>();

  onToggleFeatured(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.toggleFeatured.emit(this.movie().id);
  }
}
