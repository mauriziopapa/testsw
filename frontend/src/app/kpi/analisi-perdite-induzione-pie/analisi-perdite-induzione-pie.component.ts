import { Component } from '@angular/core';
import { PieChartModule } from 'src/app/charts/pie-chart/pie-chart.module';
import { Colors } from 'src/app/models/colors';
import { KpiOptions } from 'src/app/models/kpi-options';
import { PieChartData } from 'src/app/models/piechart-data';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
  selector: 'analisi-perdite-induzione-pie',
  standalone: true,
  imports: [PieChartModule, SharedModule],
  templateUrl: './analisi-perdite-induzione-pie.component.html',
  styleUrls: ['./analisi-perdite-induzione-pie.component.scss']
})
export class AnalisiPerditeInduzionePieComponent extends AbstractKPIComponent {
  override name = 'analisi-perdite-induzione-pie';
  override url = 'analisi_perdite_induzione_pie';
  pz_ora_ponderato = 0;
  currentOptions: any;

  buildData(result: any): void {
    if (Array.isArray(result)) {
      const valoriAnnui = result.flatMap((d) => d.valori);
      const labels = valoriAnnui.map((d) => d.label);

      const backgroundColor = valoriAnnui.map((v, index) => Colors.getColor(index).color);
      const hoverColor = valoriAnnui.map((v, index) => Colors.getColor(index).hoverColor);
      const data = valoriAnnui.map((v) => v.data);

      const datasets = [PieChartData.builPieData(data, '', backgroundColor, hoverColor)];

      this.currentData = { labels, datasets };
      this.currentOptions = KpiOptions.buildPieTopLegendOptions();

      const cols = this.dashboardService.getCols();
      // Workaround per far visualizzare bene il grafico a torta e centrato nel div
      setTimeout(() => PieChartData.workaroudAdaptThePie(cols), 3000);
    }
  }
}
