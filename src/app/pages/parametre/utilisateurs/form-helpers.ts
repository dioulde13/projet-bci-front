import { FormGroup } from '@angular/forms';

/**
 * Vérifie si un champ est invalide (touché ou modifié).
 */
export function isInvalid(form: FormGroup, controlName: string): boolean {
  const control = form.get(controlName);
  return !!(control && control.invalid && (control.touched || control.dirty));
}

/**
 * Vérifie si un champ est valide
 */
export function isValid(form: FormGroup, controlName: string): boolean {
  const control = form.get(controlName);
  return !!(control && control.valid && (control.touched || control.dirty));
}

/**
 * Retourne le message d'erreur correspondant au validateur.
 */
export function getErrorMessage(
  form: FormGroup,
  controlName: string
): string | null {
  const control = form.get(controlName);
  if (!control) return null;

  if (control.hasError('required')) return 'Ce champ est obligatoire.';

  if (control.hasError('email')) return 'Adresse e-mail invalide.';

  if (control.hasError('minlength'))
    return `Ce champ doit contenir au moins ${control.errors?.['minlength'].requiredLength} caractères.`;

  if (control.hasError('maxlength'))
    return `Ce champ ne peut pas dépasser ${control.errors?.['maxlength'].requiredLength} caractères.`;

  if (control.hasError('pattern')) return 'Le format de ce champ est invalide.';

  if (control.hasError('passwordMismatch'))
    return 'Les mots de passe ne correspondent pas.';

  if (control.hasError('mismatch'))
    return 'Les mots de passe ne correspondent pas.';

  return null;
}

/**
 * Retourne les classes CSS Bootstrap en fonction de l'état du champ
 */
export function getFormControlClass(form: FormGroup, controlName: string): any {
  return {
    'is-invalid': isInvalid(form, controlName),
    'is-valid': isValid(form, controlName),
  };
}