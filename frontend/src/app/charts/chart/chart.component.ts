import { Component, Input } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'base-chart',
  template: ` <p></p> `,
  styles: []
})
export class AbstractChartComponent {
  @Input() data: ChartData;
  @Input() name = 'default';
  @Input() options: ChartOptions;

  constructor() {
    // dati di default vuoti
    this.data = {
      labels: [],
      datasets: [
        {
          label: '',
          backgroundColor: '#ff9900',
          borderColor: '#ff9900',
          borderWidth: 0,
          hoverBackgroundColor: '#88abf0;',
          hoverBorderColor: '#88abf0;',
          data: []
        }
      ]
    };

    this.options = {
      maintainAspectRatio: true,
      scales: {
        y: {
          stacked: false,
          grid: {
            display: true,
            color: '#cccccc'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          position: 'right' as const,
          align: 'start' as const
        }
      }
    };
  }
}
