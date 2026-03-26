export class KpiOptions {
  private static standardScales = {
    y: {
      stacked: false,
      grid: {
        display: true,
        color: '#cccccc'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  };

  private static stackedScales = {
    y: {
      stacked: true,
      grid: {
        display: true,
        color: '#cccccc'
      }
    },
    x: {
      stacked: true,
      grid: {
        display: false
      }
    }
  };

  private static mixedScales = {
    x: {
      stacked: true,
      grid: {
        display: false
      }
    }
  };

  private static topLegend = {
    position: 'top' as const,
    align: 'top' as const
  };

  private static bottomLegend = {
    position: 'bottom' as const,
    align: 'bottom' as const
  };

  private static rightLegend = {
    position: 'right' as const,
    align: 'right' as const
  };

  static buildOptionWithBottomLegend(scale = this.standardScales): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: scale,
      plugins: {
        legend: this.bottomLegend
      }
    };
  }

  static buildOptionWithRightLegend(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: this.standardScales,
      plugins: {
        legend: this.rightLegend
      }
    };
  }

  static buildOptionWithBottomLegendAndCustomTooltip(tooltip: any): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: this.standardScales,
      plugins: {
        legend: this.bottomLegend,
        tooltip
      }
    };
  }

  static buildOptionWithCustomTooltip(tooltip: any, scale = this.standardScales): any {
    return {
      maintainAspectRatio: true,
      scales: scale,
      plugins: {
        legend: this.rightLegend,
        tooltip
      }
    };
  }

  static buildStackedOptionWithCustomTooltip(tooltip: any): any {
    return {
      maintainAspectRatio: true,
      scales: this.stackedScales,
      plugins: {
        legend: this.rightLegend,
        tooltip
      }
    };
  }

  static buildStackedOptionWithBottomLegendAndCustomTooltip(tooltip: any): any {
    return {
      maintainAspectRatio: false,
      scales: this.stackedScales,
      plugins: {
        legend: this.bottomLegend,
        tooltip
      }
    };
  }

  static buildStackedOptionWithCustomTooltipNoLegend(
    tooltip: any,
    scales = this.stackedScales
  ): any {
    return {
      maintainAspectRatio: true,
      scales: scales,
      plugins: {
        legend: null,
        tooltip
      }
    };
  }

  static buildMixedOptionWithCustomTooltip(tooltip: any): any {
    return {
      maintainAspectRatio: true,
      scales: this.mixedScales,
      plugins: {
        legend: this.rightLegend,
        tooltip
      }
    };
  }

  static buildMixedOptionWithBottomLegendAndCustomTooltip(tooltip: any): any {
    return {
      maintainAspectRatio: true,
      scales: this.mixedScales,
      plugins: {
        legend: this.bottomLegend,
        tooltip
      }
    };
  }

  static buildTooltipWith(symbol: string) {
    const tooltip = {
      callbacks: {
        label: function (context: any) {
          let label = context.dataset.label || '';

          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += context.parsed.y + ` ${symbol}`;
          }
          return label;
        }
      }
    };

    return tooltip;
  }

  static buildCurrencyTooltip(currency: string) {
    const tooltip = {
      callbacks: {
        label: function (context: any) {
          let label = context.dataset.label || '';

          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('it-IT', {
              style: 'currency',
              currency
            }).format(context.parsed.y);
          }
          return label;
        }
      }
    };

    return tooltip;
  }

  static buildPieOptions(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: this.rightLegend
      }
    };
  }

  static buildPieBottomLegendOptions(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: this.bottomLegend
      }
    };
  }

  static buildPieTopLegendOptions(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: this.topLegend
      }
    };
  }

  static calculateStackTotals(stackValues: any[]): any {
    return stackValues.map((stack) => {
      const total = stack.data.reduce((acc: any, curr: any) => Math.round(+acc + +curr.data), 0);
      return total;
    });
  }
}
