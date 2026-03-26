import { ChartData } from './chart-data';
import { ChartTarget } from './chart-target';
import { Colors } from './colors';

export class KpiData {
  static buildFromMapToArray(valori: any[]): any {
    const datasetValues = new Map();
    const datasetSize = valori[0].length;
    // costruisco la struttura dati per il grafico che deve essere un array con
    // label: 'Dataset 1',
    // data: []
    for (let i = 0; i < datasetSize; i++) {
      for (let j = 0; j < valori.length; j++) {
        const valore = valori[j];
        if (datasetValues.has(valore[i].label)) {
          datasetValues.get(valore[i].label).push(valore[i].data);
        } else {
          datasetValues.set(valore[i].label, [valore[i].data]);
        }
      }
    }

    const datasetArray = Array.from(datasetValues, ([label, data]) => ({ label, data }));
    return datasetArray;
  }

  static buildStandardBarData(result: any[]): any {
    if (Array.isArray(result)) {
      const labels = result.map((d) => d.label);
      const valori = result.flatMap((d) => d.valori.map((v: any) => v.data));
      const valoriLabels = result.flatMap((d) => d.valori.map((v: any) => v.label));
      const targets = result.map((d) => d.target);

      const label = valoriLabels.length > 0 ? valoriLabels[0] : '';

      const datasets = [];
      datasets.push(ChartData.builCustomdBar(valori, label, Colors.BLUE, Colors.BLUE_HOVER));
      datasets.push(ChartTarget.buildTarget(targets));

      return { labels, datasets };
    }
  }

  static buildStandardAutomotiveNonAutomotiveData(
    automotive: any,
    non_automotive: any,
    targets: any,
    tipology: string
  ): Array<any> {
    const datasets = [];
    if (tipology === '-tutte-' || tipology === 'automotive') {
      datasets.push(ChartData.buildAutomotive(automotive));
    }

    if (tipology === '-tutte-' || tipology === 'non_automotive') {
      datasets.push(ChartData.buildNonAutomotive(non_automotive));
    }

    datasets.push(ChartTarget.buildTarget(targets));
    return datasets;
  }
}
