import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'percentage'
})
export class PercentagePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (args === 'perc') {
      // evita lo 0 con la virgola 0.0
      if (parseFloat(value) == 0) {
        return parseFloat(value) + ' %';
      }
      return (parseFloat(value) * 100).toFixed(1) + ' %';
    }
    return value;
  }
}
