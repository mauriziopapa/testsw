import { AfterViewInit, Component, OnDestroy, SimpleChange, SimpleChanges } from '@angular/core';
import { Chart, ChartConfiguration, ChartItem, registerables } from 'node_modules/chart.js';
import { AbstractChartComponent } from '../chart/chart.component';

@Component({
    selector: 'stacked-bar-chart',
    templateUrl: './stacked-bar-chart.component.html',
    styleUrls: ['./stacked-bar-chart.component.scss'],
    standalone: false
})
export class StackedBarChartComponent
  extends AbstractChartComponent
  implements AfterViewInit, OnDestroy
{
  myBarChart: Chart | undefined;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnDestroy(): void {
    // distruggo il chart
    this.myBarChart?.destroy();
    Chart.unregister(...registerables);
    // rimuovo il canvas dal dom, altrimenti il grafico non viene ridisegnato!
    let elem = document.getElementById(`stacked-bar-chart-${this.name}`);
    elem?.remove();
  }

  createChart(): void {
    Chart.register(...registerables);

    let chartExist = Chart.getChart(`stacked-bar-chart-${this.name}`); // <canvas> id
    if (chartExist != undefined) {
      // distruggo se il chart esiste ancora
      chartExist.destroy();
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: this.data,
      options: {
        maintainAspectRatio: true,
        scales: {
          y: {
            stacked: true,
            grid: {
              display: true,
              color: '#cccccc'
            }
          },
          x: {
            stacked: true,
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
      },
      plugins: [
        {
          id: 'htmlLegendPlugin',
          afterUpdate: function (chart: any, args: any, options: any) {
            // Make sure we're applying the legend to the right chart
            if (chart.canvas.id === 'stacked-bar-chart-ripartizione-ore-manutenzione') {
              const ul = document.createElement('ul');
              const maxStackValue = chart.data.datasets
                .map((dataset: any) => dataset.stack)
                .filter((notUndefined: any) => notUndefined)
                .reduce((a: any, b: any) => Math.max(a, b), -Infinity);
              chart.data.datasets.forEach((dataset: any, i: any) => {
                if (dataset.stack === maxStackValue || dataset.type === 'line') {
                  ul.innerHTML += `
                    <span style="background-color: ${dataset.backgroundColor}; color: 
                    ${dataset.backgroundColor}">0000</span>
                    ${dataset.label.split('- 20')[0]}
                  <br/>
                `;
                }
              });

              const legend = document.getElementById('js-legend');
              if (legend?.lastElementChild) {
                return legend.replaceChildren(ul);
              }
              return document.getElementById('js-legend')!.appendChild(ul);
            }
          }
        }
      ]
    };

    const chartItem: ChartItem = document.getElementById(
      `stacked-bar-chart-${this.name}`
    ) as ChartItem;
    this.myBarChart = new Chart(chartItem, config);
  }

  ngOnChanges(changes: SimpleChanges) {
    // only run when property "data" changed
    if (changes['data']) {
      this.buildChartData(changes['data']);
    }

    if (changes['options']) {
      this.buildChartOptions(changes['options']);
    }
  }

  updateChart() {
    this.myBarChart?.update();
  }

  private buildChartData(change: SimpleChange) {
    const serverData = change.currentValue;
    if (this.myBarChart && serverData) {
      this.myBarChart.data.labels = serverData.labels;
      this.myBarChart.data.datasets = serverData.datasets;
      this.myBarChart.update('none');
    }
  }

  private buildChartOptions(change: SimpleChange) {
    const serverData = change.currentValue;
    if (this.myBarChart && serverData) {
      this.myBarChart.options = serverData;
      this.myBarChart.update();
    }
  }
}
