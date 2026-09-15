import { Injectable, signal } from '@angular/core';

const SEARCH_HISTORY_STORAGE_KEY = 'mv_search_log_v3';
const MAX_HISTORY_ENTRIES = 5;

/** Retardo del debounce del buscador de títulos, en milisegundos. */
export const SEARCH_DEBOUNCE_MS = 375;

@Injectable({ providedIn: 'root' })
export class SearchHistoryService {
  readonly history = signal<string[]>(this.readFromStorage());

  add(term: string): void {
    const trimmed = term.trim();
    if (!trimmed) {
      return;
    }
    const withoutDuplicate = this.history().filter((entry) => entry.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...withoutDuplicate].slice(0, MAX_HISTORY_ENTRIES);
    this.history.set(updated);
    this.persist(updated);
  }

  clear(): void {
    this.history.set([]);
    localStorage.removeItem(SEARCH_HISTORY_STORAGE_KEY);
  }

  private readFromStorage(): string[] {
    try {
      const raw = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }

  private persist(entries: string[]): void {
    localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(entries));
  }
}
