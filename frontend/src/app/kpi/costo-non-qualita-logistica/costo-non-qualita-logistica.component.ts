import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
  selector: 'costo-non-qualita-logistica',
  standalone: true,
  imports: [BarChartModule, SharedModule],
  templateUrl: './costo-non-qualita-logistica.component.html',
  styleUrls: ['./costo-non-qualita-logistica.component.scss']
})
export class CostoNonQualitaLogisticaComponent extends AbstractKPIComponent {
  override name = 'costo-non-qualita-logistica';
  override url = 'costo_non_qualita_logistica';
  currentOptions: any;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((d: any) => d.label);
      const data1 = result.map((d: any) => d.val);
      const data2 = result.map((d: any) => d.val_prec);
      const target = result.map((d: any) => d.target);

      const datasets = [
        ChartData.builCustomdBar(data1, 'Costo Non Qualita', Colors.BLUE, Colors.BLUE_HOVER),
        ChartData.builCustomdBar(
          data2,
          'Costo Non Qualita Prec',
          Colors.ORANGE,
          Colors.ORANGE_HOVER
        ),
        ChartTarget.buildTarget(target)
      ];

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildCurrencyTooltip('EUR');
      this.currentOptions = KpiOptions.buildOptionWithBottomLegendAndCustomTooltip(tooltip);
    }
  }
}
