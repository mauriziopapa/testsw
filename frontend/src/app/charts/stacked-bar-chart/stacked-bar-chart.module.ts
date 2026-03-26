import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StackedBarChartComponent } from './stacked-bar-chart.component';

@NgModule({
  declarations: [StackedBarChartComponent],
  imports: [CommonModule],
  exports: [StackedBarChartComponent]
})
export class StackedBarChartModule {}
