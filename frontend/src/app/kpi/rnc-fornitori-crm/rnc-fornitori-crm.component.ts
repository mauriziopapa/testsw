import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { Colors } from 'src/app/models/colors';
import { KpiData } from 'src/app/models/kpi-data';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
  selector: 'rnc-fornitori-crm',
  standalone: true,
  imports: [BarChartModule, SharedModule],
  templateUrl: './rnc-fornitori-crm.component.html',
  styleUrls: ['./rnc-fornitori-crm.component.scss']
})
export class RNCFornitoriCRMComponent extends AbstractKPIComponent {
  override name = 'rnc-fornitori-crm';
  override url = 'rnc_fornitori_crm';
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

      const datasetArray = KpiData.buildFromMapToArray(valori);

      const datasets = [
        ...datasetArray.map((arr: any, index: number) => {
          let { color, hoverColor } = Colors.getColor(index);
          return ChartData.builCustomdBar(arr.data, arr.label, color, hoverColor);
        })
      ];

      this.currentData = { labels, datasets };

      this.tot = result.ordiniTotali;
      this.non_conformi = result.nonConformi;
      this.conformi = this.tot - this.non_conformi;
      // Periodo scelto dai filtri
      this.anno = datasetArray[0].label;

      const tooltip = KpiOptions.buildTooltipWith('%');
      if (this.isMobile) {
        this.currentOptions = KpiOptions.buildOptionWithBottomLegendAndCustomTooltip(tooltip);
      } else {
        this.currentOptions = KpiOptions.buildOptionWithCustomTooltip(tooltip);
      }
    }
  }
}
