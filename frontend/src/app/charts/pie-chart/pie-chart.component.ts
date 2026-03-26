import { AfterViewInit, Component, OnDestroy, SimpleChange, SimpleChanges } from '@angular/core';
import { Chart, ChartConfiguration, ChartItem, registerables } from 'node_modules/chart.js';
import { AbstractChartComponent } from '../chart/chart.component';

@Component({
  selector: 'pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent extends AbstractChartComponent implements AfterViewInit, OnDestroy {
  myPieChart: Chart | undefined;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnDestroy(): void {
    // distruggo il chart
    this.myPieChart?.destroy();
    Chart.unregister(...registerables);
    // rimuovo il canvas dal dom, altrimenti il grafico non viene ridisegnato!
    let elem = document.getElementById(`pie-chart-${this.name}`);
    elem?.remove();
  }

  createChart(): void {
    Chart.register(...registerables);

    let chartExist = Chart.getChart(`pie-chart-${this.name}`); // <canvas> id
    if (chartExist != undefined) {
      // distruggo se il chart esiste ancora
      chartExist.destroy();
    }

    const config: ChartConfiguration = {
      type: 'pie',
      data: this.data,
      options: this.options
    };

    const chartItem: ChartItem = document.getElementById(`pie-chart-${this.name}`) as ChartItem;
    this.myPieChart = new Chart(chartItem, config);
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
    this.myPieChart?.update();
  }

  private buildChartData(change: SimpleChange) {
    const serverData = change.currentValue;
    if (this.myPieChart && serverData) {
      this.myPieChart.data.labels = serverData.labels;
      this.myPieChart.data.datasets = serverData.datasets;
      this.myPieChart.update();
    }
  }

  private buildChartOptions(change: SimpleChange) {
    const serverData = change.currentValue;
    if (this.myPieChart && serverData) {
      this.myPieChart.options = serverData;
      this.myPieChart.update();
    }
  }
}
