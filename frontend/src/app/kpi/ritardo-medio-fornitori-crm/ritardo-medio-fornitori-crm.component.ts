import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { Colors } from 'src/app/models/colors';
import { KpiData } from 'src/app/models/kpi-data';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
    selector: 'ritardo-medio-fornitori-crm',
    imports: [BarChartModule, SharedModule],
    templateUrl: './ritardo-medio-fornitori-crm.component.html',
    styleUrls: ['./ritardo-medio-fornitori-crm.component.scss']
})
export class RitardoMedioFornitoriCRMComponent extends AbstractKPIComponent {
  override name = 'ritardo-medio-fornitori-crm';
  override url = 'ritardo_medio_fornitori_crm';
  currentOptions: any;

  buildData(result: any): void {
    if (Array.isArray(result)) {
      const labels = result.map((d: any) => d.label);
      const valori = result.map((d: any) => d.valori);

      const datasetArray = KpiData.buildFromMapToArray(valori);

      const datasets = [
        ...datasetArray.map((arr: any, index: number) => {
          let { color, hoverColor } = Colors.getColor(index);
          return ChartData.builCustomdBar(arr.data, arr.label, color, hoverColor);
        })
      ];

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildTooltipWith('gg');
      this.currentOptions = KpiOptions.buildOptionWithCustomTooltip(tooltip);
    }
  }
}
