import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { Colors } from 'src/app/models/colors';
import { KpiData } from 'src/app/models/kpi-data';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
  selector: 'puntualita-fornitori-crm',
  standalone: true,
  imports: [BarChartModule, SharedModule],
  templateUrl: './puntualita-fornitori-crm.component.html',
  styleUrls: ['./puntualita-fornitori-crm.component.scss']
})
export class PuntualitaFornitoriCRMComponent extends AbstractKPIComponent {
  override name = 'puntualita-fornitori-crm';
  override url = 'puntualita_fornitori_crm';
  currentOptions: any;
  puntuali = 0;
  in_ritardo = 0;
  tot = 0;
  anno = 2023;

  buildData(result: any): void {
    this.puntuali = 0;
    this.in_ritardo = 0;
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

      this.tot = result.ordini;
      this.in_ritardo = result.ordiniInRitardo;
      this.puntuali = this.tot - this.in_ritardo;
      // Periodo scelto dai filtri
      this.anno = datasetArray[0].label;

      const tooltip = KpiOptions.buildTooltipWith('%');
      this.currentOptions = KpiOptions.buildOptionWithCustomTooltip(tooltip);
    }
  }
}
