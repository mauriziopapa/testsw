import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { Value } from '../models/value';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private baseUrl = `${environment.apiUrl}/kpi`;

  constructor(private http: HttpClient) {}

  getReport(kpi: string): Observable<Array<Value>> {
    let apiUrl = `${this.baseUrl}/${kpi}`;
    return this.http.get<Array<Value>>(apiUrl);
  }
}
