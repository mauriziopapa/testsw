import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DashboardWidgets } from '../models/dashboard-widget';
import { KpiInfo } from '../models/kpi-info';
import { Widget } from '../models/widget';
import { WidgetConstants } from '../models/widget.constants';

// per bypassare l'interceptor
import { BYPASS } from '../core/network.interceptor';

@Injectable({
  providedIn: 'root'
})
export class WidgetService {
  constructor(private http: HttpClient) {}

  getDashboardWidgets(url: string): Observable<Array<DashboardWidgets>> {
    return this.http.get<Array<DashboardWidgets>>(
      `${environment.apiUrl}/dashboards/${url}/widgets`
    );
  }

  getWidgets$(url: string): Observable<Array<Widget>> {
    return this.getDashboardWidgets(url).pipe(
      map((widgets: Array<DashboardWidgets>) => {
        return widgets.map((w) => {
          return new Widget(WidgetConstants.getWidgetNameFromId(w.idwidget), {
            cols: 1,
            rows: 1,
            title: w.name,
            url: w.url,
            widget_instance: w.idwidget_instance,
            kpi: w.idwidget,
            position: w.position
          });
        });
      })
    );
  }

  getWidgetInfo(widgetId: number): Observable<KpiInfo> {
    return this.http.get<KpiInfo>(`${environment.apiUrl}/kpi_info/${widgetId}`);
  }

  updateOrder(url: string, widgets: Array<DashboardWidgets>): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/dashboards/${url}/widgets/`, widgets, {
      context: new HttpContext().set(BYPASS, true)
    });
  }
}
