import {
  Directive,
  ElementRef,
  HostListener,
} from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[gnfNumberFormat]',
})
export class GnfNumberFormatDirective {
  constructor(
    private el: ElementRef<HTMLInputElement>,
    private control: NgControl
  ) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;

    // Supprimer tout sauf les chiffres
    const rawValue = input.value.replace(/\D/g, '');

    if (!rawValue) {
      this.control.control?.setValue(null, { emitEvent: false });
      input.value = '';
      return;
    }

    const numericValue = Number(rawValue);

    // Mettre à jour le FormControl
    this.control.control?.setValue(numericValue, { emitEvent: false });

    // Affichage formaté
    input.value = numericValue.toLocaleString('fr-FR');
  }

  @HostListener('blur')
  onBlur(): void {
    const value = this.control.control?.value;
    if (value !== null && value !== undefined) {
      this.el.nativeElement.value =
        value.toLocaleString('fr-FR');
    }
  }
}
