import { AfterViewInit, Component, OnDestroy, SimpleChange, SimpleChanges } from '@angular/core';
import { Chart, ChartConfiguration, ChartItem, registerables } from 'node_modules/chart.js';
import { AbstractChartComponent } from '../chart/chart.component';

@Component({
    selector: 'line-chart',
    templateUrl: './line-chart.component.html',
    styleUrls: ['./line-chart.component.scss'],
    standalone: false
})
export class LineChartComponent extends AbstractChartComponent implements AfterViewInit, OnDestroy {
  myLineChart: Chart | undefined;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnDestroy(): void {
    // distruggo il chart
    this.myLineChart?.destroy();
    Chart.unregister(...registerables);
    // rimuovo il canvas dal dom, altrimenti il grafico non viene ridisegnato!
    let elem = document.getElementById(`line-chart-${this.name}`);
    elem?.remove();
  }

  createChart(): void {
    Chart.register(...registerables);

    let chartExist = Chart.getChart(`line-chart-${this.name}`); // <canvas> id
    if (chartExist != undefined) {
      // distruggo se il chart esiste ancora
      chartExist.destroy();
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: this.data,
      options: this.options
    };

    const chartItem: ChartItem = document.getElementById(`line-chart-${this.name}`) as ChartItem;
    this.myLineChart = new Chart(chartItem, config);
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
    this.myLineChart?.update();
  }

  private buildChartData(change: SimpleChange) {
    const serverData = change.currentValue;
    if (this.myLineChart && serverData) {
      this.myLineChart.data.labels = serverData.labels;
      this.myLineChart.data.datasets = serverData.datasets;
      this.myLineChart.update();
    }
  }

  private buildChartOptions(change: SimpleChange) {
    const serverData = change.currentValue;
    if (this.myLineChart && serverData) {
      this.myLineChart.options = serverData;
      this.myLineChart.update();
    }
  }
}
