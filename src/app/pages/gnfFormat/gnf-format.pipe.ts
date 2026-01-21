import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gnfFormat',
  standalone: true
})
export class GnfFormatPipe implements PipeTransform {

  transform(value: number | null | undefined): string {
    if (value == null) return '';

    // Format avec points comme séparateurs de milliers
    return value.toLocaleString('de-DE') + ' GNF';
  }

}
