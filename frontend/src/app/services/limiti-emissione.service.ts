import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { LimitiEmissione } from '../models/limiti-emissione';

@Injectable({
  providedIn: 'root'
})
export class LimitiEmissioneService {
  constructor(private http: HttpClient) {}

  getLimitiEmissione(): Observable<Array<LimitiEmissione>> {
    return this.http.get<Array<LimitiEmissione>>(`${environment.apiUrl}/limiti_inquinanti`);
  }
}
