import { ChartType } from 'chart.js';
import { Colors } from './colors';

export class ChartData {
  type = 'bar' as ChartType;
  label = '';
  backgroundColor = '';
  borderColor = '';
  borderWidth = 0;
  hoverBackgroundColor = '';
  hoverBorderColor = '';
  data: any;

  constructor(
    data: any,
    label: string,
    backgroundColor: string,
    borderColor: string,
    hoverBackgroundColor: string,
    hoverBorderColor: string
  ) {
    this.data = data;
    this.label = label;
    this.backgroundColor = backgroundColor;
    this.borderColor = borderColor;
    this.hoverBackgroundColor = hoverBackgroundColor;
    this.hoverBorderColor = hoverBorderColor;
  }

  static buildAutomotive(data: any): ChartData {
    return new ChartData(
      data,
      'Automotive',
      Colors.ORANGE,
      Colors.ORANGE,
      Colors.ORANGE_HOVER,
      Colors.ORANGE_HOVER
    );
  }

  static buildNonAutomotive(data: any): ChartData {
    return new ChartData(
      data,
      'NON Automotive',
      Colors.BLUE,
      Colors.BLUE,
      Colors.BLUE_HOVER,
      Colors.BLUE_HOVER
    );
  }

  static builCustomdBar(data: any, label: string, color: string, hoverColor: string): ChartData {
    return new ChartData(data, label, color, color, hoverColor, hoverColor);
  }
}
