import { Component } from '@angular/core';
import { LineChartModule } from 'src/app/charts/line-chart/line-chart.module';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
    selector: 'registro-induzione',
    imports: [LineChartModule, SharedModule],
    templateUrl: './registro-induzione.component.html',
    styleUrls: ['./registro-induzione.component.scss']
})
export class RegistroInduzioneComponent extends AbstractKPIComponent {
  override name = 'registro-induzione';
  override url = 'registro_induzione';
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
    }
  }
}
