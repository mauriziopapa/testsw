import { Component } from '@angular/core';
import { LineChartModule } from 'src/app/charts/line-chart/line-chart.module';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
  selector: 'registro-induzione-ponderato',
  standalone: true,
  imports: [LineChartModule, SharedModule],
  templateUrl: './registro-induzione-ponderato.component.html',
  styleUrls: ['./registro-induzione-ponderato.component.scss']
})
export class RegistroInduzionePonderatoComponent extends AbstractKPIComponent {
  override name = 'registro-induzione-ponderato';
  override url = 'registro_induzione_ponderato';
  currentOptions: any;
  pz_ora_ponderato = 0;

  buildData(result: any): void {
    if (result) {
      const labels = result.data.map((d: any) => d.label);
      const pz_ora = result.data.map((d: any) => d.pz_ora);
      const targets = result.data.map((d: any) => d.target);

      const datasets = [];

      datasets.push(ChartTarget.buildLine(pz_ora, 'pz/h', Colors.GREEN, Colors.GREEN_HOVER));
      datasets.push(ChartTarget.buildTarget(targets));

      this.pz_ora_ponderato = result.pz_ora_ponderato;
      this.currentData = { labels, datasets };

      const cols = this.dashboardService.getCols();
      this.adaptChart(cols);
      if (this.isMobile) {
        this.currentOptions = KpiOptions.buildOptionWithBottomLegend();
      } else {
        this.currentOptions = KpiOptions.buildOptionWithRightLegend();
      }
    }
  }

  adaptChart(cols: number): void {
    try {
      const collection = Array.from(
        document.getElementsByClassName('line-chart-container') as HTMLCollectionOf<HTMLElement>
      );
      for (let i = 0; i < collection.length; i++) {
        if (cols <= 2) {
          collection[i]!.style.height = '28em';
          collection[i]!.style.width = '65em';
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}
