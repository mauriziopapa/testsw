import { ChartType } from 'chart.js';

export class PieChartData {
  type = 'pie' as ChartType;
  label = '';
  backgroundColor: string[];
  hoverBackgroundColor: string[];
  tooltip: any;

  data: any;

  constructor(
    data: any,
    label: string,
    backgroundColor: string[],
    hoverBackgroundColor: string[],
    tooltip: any
  ) {
    this.data = data;
    this.label = label;
    this.backgroundColor = backgroundColor;
    this.hoverBackgroundColor = hoverBackgroundColor;
    this.tooltip = tooltip;
  }

  static builPieData(
    data: any,
    label: string,
    colors: string[],
    hoverColors: string[],
    tooltip = percTooltip
  ): PieChartData {
    return new PieChartData(data, label, colors, hoverColors, tooltip);
  }

  static workaroudAdaptThePie(cols: number) {
    // Workaround per far visualizzare bene il grafico a torta e centrato nel div
    try {
      const collection = Array.from(
        document.getElementsByClassName('pie-chart-container') as HTMLCollectionOf<HTMLElement>
      );
      for (let i = 0; i < collection.length; i++) {
        if (cols > 2) {
          collection[i]!.style.height = '20em';
        } else {
          // bigger pie!
          collection[i]!.style.height = '33em';
          collection[i]!.style.width = '50em';
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}

const percTooltip = {
  callbacks: {
    label: function (context: any) {
      let label = context.label;
      let value = context.formattedValue;

      if (!label) label = 'Unknown';

      let sum = 0;
      let dataArr = context.chart.data.datasets[0].data;
      dataArr.map((data: any) => {
        sum += parseFloat(data);
      });

      let percentage = ((parseFloat(value) * 100) / sum).toFixed(2) + ' %';
      return label + ': ' + percentage;
    }
  }
};
