import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { Colors } from 'src/app/models/colors';
import { KpiData } from 'src/app/models/kpi-data';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';
import { ChartTarget } from 'src/app/models/chart-target';

@Component({
    selector: 'rnc-fornitori-ts',
    imports: [BarChartModule, SharedModule],
    templateUrl: './rnc-fornitori-ts.component.html',
    styleUrls: ['./rnc-fornitori-ts.component.scss']
})
export class RNCFornitoriTSComponent extends AbstractKPIComponent {
  override name = 'rnc-fornitori-ts';
  override url = 'rnc_fornitori_ts';
  currentOptions: any;
  conformi = 0;
  non_conformi = 0;
  tot = 0;
  anno = 2023;

  buildData(result: any): void {
    this.conformi = 0;
    this.non_conformi = 0;
    this.tot = 0;
    if (result) {
      const valueGroup = result.valueGroup;
      const labels = valueGroup.map((d: any) => d.label);
      const valori = valueGroup.map((d: any) => d.valori);
      const targets = valueGroup.map((d: any) => d.target);

      const datasetArray = KpiData.buildFromMapToArray(valori);

      const datasets = [
        ...datasetArray.map((arr: any, index: number) => {
          let { color, hoverColor } = Colors.getColor(index);
          return ChartData.builCustomdBar(arr.data, arr.label, color, hoverColor);
        })
      ];
      datasets.push(ChartTarget.buildTarget(targets));

      this.currentData = { labels, datasets };

      this.tot = result.ordiniTotali;
      this.non_conformi = result.nonConformi;
      this.conformi = this.tot - this.non_conformi;
      // Periodo scelto dai filtri
      this.anno = datasetArray[0].label;

      const tooltip = KpiOptions.buildTooltipWith('%');
      this.currentOptions = KpiOptions.buildOptionWithBottomLegendAndCustomTooltip(tooltip);
    }
  }
}
