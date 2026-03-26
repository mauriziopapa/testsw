import { Component } from '@angular/core';
import { StackedBarChartModule } from 'src/app/charts/stacked-bar-chart/stacked-bar-chart.module';
import { ChartGroupData } from 'src/app/models/chart-group-data';
import { KpiOptions } from 'src/app/models/kpi-options';
import { Colors } from 'src/app/models/colors';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';
import { ChartTarget } from 'src/app/models/chart-target';

@Component({
  selector: 'azioni-miglioramento-tags2',
  standalone: true,
  imports: [StackedBarChartModule, SharedModule],
  templateUrl: './azioni-miglioramento-tags2.component.html',
  styleUrls: ['./azioni-miglioramento-tags2.component.scss']
})
export class AzioniMiglioramentoTags2Component extends AbstractKPIComponent {
  override name = 'azioni-miglioramento-tags2';
  override url = 'azioni_miglioramento_tags2';
  currentOptions: any;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((l) => l.label);
      const targets = result.map((d) => d.target);
      const stackArray = result.flatMap((r) => r.valori).map((l) => l.label);
      const stackValues = result.flatMap((r) => r.valori);
      const stacks = new Set(stackArray);

      const datasets = ChartGroupData.buildDatasetsFromStacks(stacks, stackValues);

       // 🔽 Assegna i colori personalizzati in base al label
      datasets.forEach((dataset, index) => {
        if (dataset.label === "# Aperte / In Corso") {
          dataset.backgroundColor = Colors.BLUE;
          dataset.hoverBackgroundColor = Colors.BLUE_HOVER;
        } else if (dataset.label === "# Chiuse in tempo con esito positivo") {
          dataset.backgroundColor = Colors.GREEN;
          dataset.hoverBackgroundColor = Colors.GREEN_HOVER;
        } else {
          const { color, hoverColor } = Colors.getColor(index);
          dataset.backgroundColor = color;
          dataset.hoverBackgroundColor = hoverColor;
        }
      });

      datasets.push(ChartTarget.buildTarget(targets));

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildTooltipWith('#');
      this.currentOptions = KpiOptions.buildStackedOptionWithCustomTooltip(tooltip);
    }
  }
}
