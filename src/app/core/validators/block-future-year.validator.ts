import { AbstractControl, ValidationErrors } from '@angular/forms';

/** Rechaza años de estreno posteriores al año en curso. */
export function blockFutureYear(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (value === null || value === '' || value === undefined) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  return Number(value) > currentYear ? { blockFutureYear: true } : null;
}
