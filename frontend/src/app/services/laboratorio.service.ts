import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { LaboratorioTable } from '../models/laboratorio-table';

@Injectable({
  providedIn: 'root'
})
export class LaboratorioService {
  constructor(private http: HttpClient) {}

  findLabData(year: string): Observable<Array<LaboratorioTable>> {
    return this.http.get<Array<LaboratorioTable>>(
      `${environment.apiUrl}/tabella_laboratorio?anno=${year}`
    );
  }

  saveBudget(laboratorio: Array<LaboratorioTable>): Observable<Object> {
    return this.http.post(`${environment.apiUrl}/tabella_laboratorio`, laboratorio);
  }
}
