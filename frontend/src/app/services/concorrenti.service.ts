import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConcorrentiService {
  constructor(private http: HttpClient) {}

  getData(yearFrom: string, yearTo: string): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/tabella_concorrenti?yearFrom=${yearFrom}&yearTo=${yearTo}`
    );
  }

  postData(kpi_rows: any) {
    const body = kpi_rows.flatMap((row: any) => row.valori);
    return this.http.post<any>(`${environment.apiUrl}/tabella_concorrenti`, body);
  }
}
