import { Component } from '@angular/core';
import { PieChartModule } from 'src/app/charts/pie-chart/pie-chart.module';
import { Colors } from 'src/app/models/colors';
import { KpiOptions } from 'src/app/models/kpi-options';
import { PieChartData } from 'src/app/models/piechart-data';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
    selector: 'fatturato-macroaree',
    imports: [PieChartModule, SharedModule],
    templateUrl: './fatturato-macroaree.component.html',
    styleUrls: ['./fatturato-macroaree.component.scss']
})
export class FatturatoMacroareeComponent extends AbstractKPIComponent {
  override name = 'fatturato-macroaree';
  override url = 'fatturato_macroaree';
  currentOptions: any;

  percTooltip = {
    callbacks: {
      label: function (context: any) {
        let label = context.label;
        // raw value
        let value = context.raw;
        let formattedValue = new Intl.NumberFormat('it-IT', {
          style: 'currency',
          currency: 'EUR'
        }).format(value);

        if (!label) label = 'Unknown';

        let sum = 0;
        let dataArr = context.chart.data.datasets[0].data;
        dataArr.map((data: any) => {
          sum += parseFloat(data);
        });

        let perc = ((parseFloat(value) * 100) / sum).toFixed(1).replace('.', ',');
        let percentage = formattedValue + ' (' + perc + '%)';
        return label + ': ' + percentage;
      }
    }
  };

  buildData(result: any): void {
    if (Array.isArray(result)) {
      const valoriAnnui = result.flatMap((d) => d.valori);
      const labels = valoriAnnui.map((d) => d.label);

      const backgroundColor = valoriAnnui.map((v, index) => Colors.getColor(index).color);
      const hoverColor = valoriAnnui.map((v, index) => Colors.getColor(index).hoverColor);
      const data = valoriAnnui.map((v) => v.data);

      const datasets = [
        PieChartData.builPieData(data, '', backgroundColor, hoverColor, this.percTooltip)
      ];

      this.currentData = { labels, datasets };
      this.currentOptions = KpiOptions.buildPieTopLegendOptions();
    }
  }
}
