import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[onlyNumbers]'
})
export class OnlyNumbersDirective {

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete'
    ];

    if (!/^[0-9]$/.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }
}
