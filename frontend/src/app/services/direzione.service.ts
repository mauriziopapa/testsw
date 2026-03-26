import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DirezioneService {
  constructor(private http: HttpClient) {}

  getData(yearFrom: string, yearTo: string): Observable<any> {
    return this.http
      .get<any>(`${environment.apiUrl}/tabella_direzione?yearFrom=${yearFrom}&yearTo=${yearTo}`)
      .pipe(
        map((rows: any) => {
          rows.kpi_rows.forEach((element: any) => {
            if (element.calcolato) {
              // conversione perchè sul db i file sono salvati già in percentuale
              element.valori.forEach((v: any) => (v.val = v.val / 100));
            }
          });
          return rows;
        })
      );
  }

  postData(kpi_rows: any) {
    const body = kpi_rows.flatMap((row: any) => {
      if (row.calcolato) {
        // conversione perchè sul db i file sono salvati già in percentuale
        return row.valori.map((v: any) => ({
          id: v.id,
          anno: v.anno,
          sem: v.sem,
          kpi: v.kpi,
          val: v.val * 100
        }));
      }
      return row.valori;
    });
    return this.http.post<any>(`${environment.apiUrl}/tabella_direzione`, body);
  }
}
