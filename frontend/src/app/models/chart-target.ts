import { ChartType } from 'chart.js';

export class ChartTarget {
  type = 'line' as ChartType;
  fill = false;
  label = 'Target';
  pointRadius = 1;
  borderWidth = 2;
  pointStyle = 'line';
  borderColor = '#dc3912';
  backgroundColor = '#dc3912';
  data: any;

  constructor(
    data: any,
    label: string,
    borderColor: string,
    backgroundColor: string,
    pointRadius: number,
    borderWidth: number
  ) {
    this.data = data;
    this.label = label;
    this.borderColor = borderColor;
    this.backgroundColor = backgroundColor;
    this.pointRadius = pointRadius;
    this.borderWidth = borderWidth;
  }

  static buildTarget(data: any): ChartTarget {
    return new ChartTarget(data, 'Target', '#dc3912', '#dc3912', 1, 2);
  }

  static buildLine(
    data: any,
    label: string,
    borderColor: string,
    backgroundColor: string
  ): ChartTarget {
    return new ChartTarget(data, label, borderColor, backgroundColor, 1, 2);
  }

  static buildLineWithRadius(
    data: any,
    label: string,
    borderColor: string,
    backgroundColor: string,
    pointRadius: number,
    borderWidth: number
  ): ChartTarget {
    return new ChartTarget(data, label, borderColor, backgroundColor, pointRadius, borderWidth);
  }
}
