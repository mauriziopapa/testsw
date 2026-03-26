import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Filters } from '../models/filters';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class KpiService {
  private baseUrl = `${environment.apiUrl}/kpi`;

  constructor(private http: HttpClient) {}

  getKpi(kpi: string, filters: Filters, kpi_id = 0): Observable<Array<any>> {
    let apiUrl = `${this.baseUrl}/${kpi}?`;
    apiUrl = this.appendFilter(apiUrl, 'from=', filters.from);
    apiUrl = this.appendFilter(apiUrl, '&to=', filters.to);
    apiUrl = this.appendFilter(apiUrl, '&target=', filters.target);
    apiUrl = this.appendFilter(apiUrl, '&year=', filters.year);
    apiUrl = this.appendFilter(apiUrl, '&yearFrom=', filters.yearFrom);
    apiUrl = this.appendFilter(apiUrl, '&yearTo=', filters.yearTo);
    apiUrl = this.appendFilter(apiUrl, '&zona=', filters.zone);
    apiUrl = this.appendFilter(apiUrl, '&cliente=', filters.client);
    apiUrl = this.appendFilter(apiUrl, '&tipologia=', filters.tipology);
    apiUrl = this.appendFilter(apiUrl, '&pezzo=', filters.piece);
    apiUrl = this.appendFilter(apiUrl, '&operatore=', filters.operator);
    apiUrl = this.appendFilter(apiUrl, '&reparto=', filters.reparto);
    apiUrl = this.appendFilter(apiUrl, '&pde=', filters.pde);
    apiUrl = this.appendFilter(apiUrl, '&kpi_id=', kpi_id.toString());
    apiUrl = this.appendFilter(apiUrl, '&materia_prima=', filters.material);
    apiUrl = this.appendFilter(apiUrl, '&fornitore=', filters.supplier);
    apiUrl = this.appendFilter(apiUrl, '&rischio=', filters.risk);
    apiUrl = this.appendFilter(apiUrl, '&tipo_offerta=', filters.offer);
    apiUrl = this.appendFilter(apiUrl, '&macroarea=', filters.macroarea);

    return this.http.get<Array<any>>(apiUrl);
  }

  private appendFilter(input: string, filter: string, valToAppend: string): string {
    if (valToAppend != null && valToAppend != 'null') {
      return input.concat(filter, valToAppend.toString().trim());
    }
    return input;
  }
}
