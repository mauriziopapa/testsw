import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { KpiData } from 'src/app/models/kpi-data';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
  selector: 'perc-investimento-formazione',
  standalone: true,
  imports: [BarChartModule, SharedModule],
  templateUrl: './perc-investimento-formazione.component.html',
  styleUrls: ['./perc-investimento-formazione.component.scss']
})
export class PercInvestimentoFormazioneComponent extends AbstractKPIComponent {
  override name = 'perc-investimento-formazione';
  override url = 'perc_investimento_formazione';
  currentOptions: any;
  formazione = 0;
  budget = 0;
  fatturato = 0;

  buildData(result: any): void {
    this.formazione = result.formazione;
    this.budget = result.budget;
    this.fatturato = result.fatturato;

    if (Array.isArray(result.data)) {
      const labels = result.data.map((l: any) => l.label);
      const valori = result.data.map((d: any) => d.valori);
      const targets = result.data.map((d: any) => d.target);

      const datasetArray = KpiData.buildFromMapToArray(valori);
      const datasets = [
        ...datasetArray.map((arr: any, index: number) => {
          let { color, hoverColor } = Colors.getColor(index);
          return ChartData.builCustomdBar(arr.data, arr.label, color, hoverColor);
        })
      ];
      datasets.push(ChartTarget.buildTarget(targets));

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildTooltipWith('%');
      this.currentOptions = KpiOptions.buildOptionWithCustomTooltip(tooltip);
    }
  }
}
