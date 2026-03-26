import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
    selector: 'costo-medio-trasporti',
    imports: [BarChartModule, SharedModule],
    templateUrl: './costo-medio-trasporti.component.html',
    styleUrls: ['./costo-medio-trasporti.component.scss']
})
export class CostoMedioTrasportiComponent extends AbstractKPIComponent {
  override name = 'costo-medio-trasporti';
  override url = 'costo_medio_trasporti';

  buildData(result: any): void {
    if (result) {
      const labels = result.data.map((d: any) => d.label);
      const valori = result.data.map((d: any) => d.values);
      const targets = result.data.map((d: any) => d.target);
      console.log(valori);

      const datasetValues = new Map();
      const datasetSize = valori[0].length;

      // costruisco la struttura dati per il grafico che deve essere un array con
      // label: 'Dataset 1',
      // data: []
      for (let i = 0; i < datasetSize; i++) {
        for (let j = 0; j < valori.length; j++) {
          const valorePerZona = valori[j];

          if (result.zone.length === 0) {
            result.zone.push('Costo medio trasporto €/Kg');
          }

          if (datasetValues.has(result.zone[i])) {
            datasetValues.get(result.zone[i]).push(valorePerZona[i]);
          } else {
            datasetValues.set(result.zone[i], [valorePerZona[i]]);
          }
        }
      }

      const datasetArray = Array.from(datasetValues, ([label, data]) => ({ label, data }));

      const datasets = [
        ...datasetArray.map((arr: any, index: number) => {
          let { color, hoverColor } = Colors.getColor(index);
          return ChartData.builCustomdBar(arr.data, arr.label, color, hoverColor);
        }),
        ChartTarget.buildTarget(targets)
      ];

      this.currentData = { labels, datasets };
    }
  }
}
