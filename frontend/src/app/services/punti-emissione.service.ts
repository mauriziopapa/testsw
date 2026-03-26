import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { PuntoDiEmissione } from '../models/punto-di-emissione';

@Injectable({
  providedIn: 'root'
})
export class PuntiEmissioneService {
  constructor(private http: HttpClient) {}

  getPuntiEmissione(): Observable<Array<PuntoDiEmissione>> {
    return this.http.get<Array<PuntoDiEmissione>>(`${environment.apiUrl}/punti_di_emissione`);
  }
}
