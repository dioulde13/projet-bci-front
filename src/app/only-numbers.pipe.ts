import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'onlyNumbers'
})
export class OnlyNumbersPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
