import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[onlyNumbers]'
})
export class OnlyNumbersDirective {

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInputChange(event: any) {
    // Transforme la valeur pour ne garder que les chiffres (0‑9)
    const filtered = this.el.nativeElement.value.replace(/[^0-9]/g, '');
    
    // Si des caractères non autorisés ont été entrés, on met à jour l'input
    if (filtered !== this.el.nativeElement.value) {
      this.el.nativeElement.value = filtered;
      event.stopPropagation();
    }
  }
}