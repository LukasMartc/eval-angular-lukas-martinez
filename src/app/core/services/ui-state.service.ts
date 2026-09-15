import { Injectable, signal } from '@angular/core';

export type LayoutMode = 'reel' | 'strip';

@Injectable({ providedIn: 'root' })
export class UiStateService {
  /** Controla cómo se dibuja el listado de películas: en grilla (reel) o en lista compacta (strip). */
  readonly layoutMode = signal<LayoutMode>('reel');

  toggleLayoutMode(): void {
    this.layoutMode.update((mode) => (mode === 'reel' ? 'strip' : 'reel'));
  }
}
