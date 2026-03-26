import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { KeyValueTable } from '../models/key-value-table';

@Injectable({
  providedIn: 'root'
})
export class CommercialeService {
  constructor(private http: HttpClient) {}

  getTable(year: string): Observable<Array<KeyValueTable>> {
    return this.http.get<Array<KeyValueTable>>(
      `${environment.apiUrl}/tabella_dati_commerciali?anno=${year}`
    );
  }

  saveTable(table: Array<KeyValueTable>): Observable<Object> {
    return this.http.post(`${environment.apiUrl}/tabella_dati_commerciali`, table);
  }
}
