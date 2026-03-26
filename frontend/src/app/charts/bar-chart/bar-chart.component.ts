import { AfterViewInit, Component, OnDestroy, SimpleChange, SimpleChanges } from '@angular/core';
import { Chart, ChartConfiguration, ChartItem, registerables } from 'node_modules/chart.js';
import { AbstractChartComponent } from '../chart/chart.component';

@Component({
  selector: 'bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent extends AbstractChartComponent implements AfterViewInit, OnDestroy {
  myBarChart: Chart | undefined;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnDestroy(): void {
    // distruggo il chart
    this.myBarChart?.destroy();
    Chart.unregister(...registerables);
    // rimuovo il canvas dal dom, altrimenti il grafico non viene ridisegnato!
    let elem = document.getElementById(`bar-chart-${this.name}`);
    elem?.remove();
  }

  createChart(): void {
    Chart.register(...registerables);

    let chartExist = Chart.getChart(`bar-chart-${this.name}`); // <canvas> id
    if (chartExist != undefined) {
      // distruggo se il chart esiste ancora
      chartExist.destroy();
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: this.data,
      options: this.options
    };

    const chartItem: ChartItem = document.getElementById(`bar-chart-${this.name}`) as ChartItem;
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
      this.myBarChart.update();
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
