import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Filters } from '../models/filters';

import { HttpClient } from '@angular/common/http';
import { FilterValues } from '../models/filter-values';

@Injectable({
  providedIn: 'root'
})
export class FiltersService {
  constructor(private http: HttpClient) {}

  getGlobalFilters(dashboard_instance: number): Observable<Array<any>> {
    return this.http.get<Array<any>>(`${environment.apiUrl}/filters/global/${dashboard_instance}`);
  }

  getKpiFilters(widget_instance: number): Observable<Array<any>> {
    return this.http.get<Array<any>>(`${environment.apiUrl}/filters/${widget_instance}`);
  }

  saveKpiFilters(widget_instance: number, kpiFilters: Array<FilterValues>): Observable<Object> {
    return this.http.post(`${environment.apiUrl}/filters/${widget_instance}`, kpiFilters);
  }

  getFilterValues(kpi: string, filter: string): Observable<Array<any>> {
    return this.http.get<Array<any>>(`${environment.apiUrl}/kpi/${kpi}/${filter}`);
  }

  getFilterValuesCombo(kpi: string, filterName: string, comboName: string): Observable<Array<any>> {
    if (comboName === '-Tutti-') {
      return this.http.get<Array<any>>(`${environment.apiUrl}/kpi/${kpi}/${filterName}`);
    }
    return this.http.get<Array<any>>(`${environment.apiUrl}/kpi/${kpi}/${filterName}/${comboName}`);
  }

  getFilterValuesWithTime(kpi: string, filter: string, from: any, to: any): Observable<Array<any>> {
    return this.http.get<Array<any>>(
      `${environment.apiUrl}/kpi/${kpi}/${filter}?from=${from}&to=${to}`
    );
  }

  getGlobalValues(filter: string): Observable<Array<any>> {
    return this.http.get<Array<any>>(`${environment.apiUrl}/filters/global/values/${filter}`);
  }
}
