import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
    selector: 'emissioni',
    imports: [BarChartModule, SharedModule],
    templateUrl: './emissioni.component.html',
    styleUrls: ['./emissioni.component.scss']
})
export class EmissioniComponent extends AbstractKPIComponent {
  override name = 'emissioni';
  override url = 'emissioni';
  currentOptions: any;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((d: any) => d.etichetta_estesa);
      const data1 = result.map((d: any) => d.valore_percentuale);
      const target20 = result.map((d: any) => d.limite_al_20);
      const target50 = result.map((d: any) => d.limite_al_50);
      const target70 = result.map((d: any) => d.limite_al_70);
      const target100 = result.map((d: any) => d.limite_al_100);

      const datasets = [
        ChartData.builCustomdBar(data1, 'Valore Percentuale', Colors.BLUE, Colors.BLUE_HOVER),
        ChartTarget.buildLine(target20, 'Limite 20%', Colors.AQUA, Colors.AQUA),
        ChartTarget.buildLine(target50, 'Limite 50%', Colors.YELLOW, Colors.YELLOW),
        ChartTarget.buildLine(target70, 'Limite 70%', Colors.ORANGE, Colors.ORANGE),
        ChartTarget.buildLine(target100, 'Limite di Legge', Colors.RED, Colors.RED)
      ];

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildTooltipWith('%');
      this.currentOptions = KpiOptions.buildOptionWithCustomTooltip(tooltip);
    }
  }
}
