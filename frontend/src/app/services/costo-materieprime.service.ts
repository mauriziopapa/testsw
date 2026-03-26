import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { CostoMateriaPrima } from '../models/costo-materiaprima';

@Injectable({
  providedIn: 'root'
})
export class CostoMateriePrimeService {
  constructor(private http: HttpClient) {}

  findAllCostiMateriePrime(year: string): Observable<Array<CostoMateriaPrima>> {
    return this.http.get<Array<CostoMateriaPrima>>(
      `${environment.apiUrl}/tabella_costo_materieprime?anno=${year}`
    );
  }

  saveCostiMateriePrime(costi: Array<CostoMateriaPrima>): Observable<Object> {
    return this.http.post(`${environment.apiUrl}/tabella_costo_materieprime`, costi);
  }
}
