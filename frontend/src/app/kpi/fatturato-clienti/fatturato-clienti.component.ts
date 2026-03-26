import { Component } from '@angular/core';
import { StackedBarChartModule } from 'src/app/charts/stacked-bar-chart/stacked-bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { Colors } from 'src/app/models/colors';
import { KpiData } from 'src/app/models/kpi-data';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
  selector: 'fatturato-clienti',
  standalone: true,
  imports: [StackedBarChartModule, SharedModule],
  templateUrl: './fatturato-clienti.component.html',
  styleUrls: ['./fatturato-clienti.component.scss']
})
export class FatturatoClientiComponent extends AbstractKPIComponent {
  override name = 'fatturato-clienti';
  override url = 'fatturato_clienti';
  currentOptions: any;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
        const labels = result.map(r => r.label);

  // Dataset separati
  const fatturatoData: number[] = [];
  const budgetData: number[] = [];
  const nuoviProgettiData: number[] = [];

  for (const anno of result) {
    const valori = anno.valori || [];

    const getVal = (label: string) =>
      valori.find((v: any) => v.label === label)?.data ?? 0;

    fatturatoData.push(getVal('Fatturato con Temprasud'));
    budgetData.push(getVal('Budget Cliente'));
    nuoviProgettiData.push(getVal('Nuovi Progetti'));
  }

  // Costruisci dataset
  const datasets = [
    // Fatturato: gruppo singolo
    ChartData.builCustomdBar(fatturatoData, 'Fatturato con Temprasud', '#3366CC', '#3366CC'),
    
    // Budget + Progetti: stack 'Budget'
    {
      ...ChartData.builCustomdBar(budgetData, 'Budget Cliente', '#DD4477', '#DD4477'),
      stack: 'Budget'
    },
    {
      ...ChartData.builCustomdBar(nuoviProgettiData, 'Nuovi Progetti', '#FF9900', '#FF9900'),
      stack: 'Budget'
    }
  ];

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildCurrencyTooltip('EUR');

      if (this.isMobile) {
        this.currentOptions =
          KpiOptions.buildStackedOptionWithBottomLegendAndCustomTooltip(tooltip);
      } else {
        this.currentOptions = KpiOptions.buildStackedOptionWithCustomTooltip(tooltip);
      }
    }
  }
}
