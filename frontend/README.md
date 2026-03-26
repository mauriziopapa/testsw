# SapereTemprasud

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.2.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

Usually the "src/app/" directory is already added. If you want to generate a component into features folder you should use the command `npm run ng g c "features/commerciale"`

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Chart js

In order to use annotation

`import annotationPlugin from 'chartjs-plugin-annotation';`

`Chart.register(...registerables, annotationPlugin);`

```javascript
    const options: ChartOptions & { annotation?: any } = {
      maintainAspectRatio: false,
      scales: {
        y: {
          stacked: true,
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
      },
      plugins: {
        legend: {
          position: 'right' as const,
          align: 'start' as const
        },
        annotation: {
          annotations: [
            {
              type: 'line',
              yMin: 60,
              yMax: 60,
              borderColor: 'tomato',
              borderWidth: 1
            }
          ]
        }
      }
    };
```

## Dashoard

In order to create a new Dashboard:

1. Move into `\frontend\src\app\pages` folder
2. Copy one folder
3. Rename folder and component according to the new dashboard
4. Pay attention to rename the Routing Module and the Module itself
5. Add the new Module to the general Routing Module

## KPI

In order to create new KPIs:

1. Copy a component inside the kpi folder
2. Adjust file name and folder name
3. Adjust component name and url
4. Add widget to `WidgetConstants.ts` like this:
5. Pay attention to the Dashboard Module, _WidgetDirective_ should be imported!

```javascript
  static build(): WidgetConstants {
    this.widgets.set(94, KPIExternalComponent);
    this.widgets.set(95, PPMScartiComponent);
    this.widgets.set(96, InternalNCComponent);
    this.widgets.set(97, AddebitiComponent);
    this.widgets.set(98, CostiNonQualitaComponent);
    this.widgets.set(107, EfficaciaCampionatureComponent);
    this.widgets.set(108, RapiditaCampionatureComponent);
    this.widgets.set(151, D8TempoChiusuraComponent);
    this.widgets.set(152, D8NuoviComponent);
    this.widgets.set(143, CostiCampionatureComponent);
    return new this();
  }
```

6. If you need to add another filter remember to have a look to `KpiService` class method _getKpi_
