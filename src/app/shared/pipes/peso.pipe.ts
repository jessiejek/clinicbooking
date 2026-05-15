import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'peso',
  standalone: true
})
export class PesoPipe implements PipeTransform {
  private readonly formatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—';
    return this.formatter.format(value);
  }
}

