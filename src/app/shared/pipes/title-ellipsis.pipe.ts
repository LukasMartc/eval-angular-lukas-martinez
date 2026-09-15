import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'appTitleEllipsis' })
export class TitleEllipsisPipe implements PipeTransform {
  transform(title: string | null | undefined, maxLength = 30): string {
    if (!title) {
      return '';
    }
    return title.length > maxLength ? `${title.slice(0, maxLength).trimEnd()}…` : title;
  }
}
