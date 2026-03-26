import { ChartType } from 'chart.js';
import { Colors } from './colors';

export class ChartGroupData {
  type = 'bar' as ChartType;
  label = '';
  stack = '';
  backgroundColor = '';
  borderColor = '';
  borderWidth = 0;
  hoverBackgroundColor = '';
  hoverBorderColor = '';
  data: any;

  constructor(
    data: any,
    label: string,
    stack: string,
    backgroundColor: string,
    borderColor: string,
    hoverBackgroundColor: string,
    hoverBorderColor: string
  ) {
    this.data = data;
    this.label = label;
    this.stack = stack;
    this.backgroundColor = backgroundColor;
    this.borderColor = borderColor;
    this.hoverBackgroundColor = hoverBackgroundColor;
    this.hoverBorderColor = hoverBorderColor;
  }

  static builCustomdBar(
    data: any,
    label: string,
    stack: string,
    color: string,
    hoverColor: string
  ): ChartGroupData {
    return new ChartGroupData(data, label, stack, color, color, hoverColor, hoverColor);
  }

  static buildDatasetsFromStacks(stacks: Set<any>, stackValues: any[]): Array<any> {
    const datasets = new Array<any>();
    stacks.forEach((stack) => {
      const data = stackValues.filter((v) => v.label == stack).flatMap((m) => m.data);
      const labelSet = new Set(data.map((d) => d.label));
      let index = 0;
      labelSet.forEach((label) => {
        const dataForLabel = data.filter((l) => l.label == label).flatMap((m) => m.data);
        let { color, hoverColor } = Colors.getColor(index);
        let chartLabel = label;
        if (stack) chartLabel = `${label} - ${stack}`;
        datasets.push(
          ChartGroupData.builCustomdBar(dataForLabel, chartLabel, stack, color, hoverColor)
        );
        index++;
      });
    });

    return datasets;
  }
}
