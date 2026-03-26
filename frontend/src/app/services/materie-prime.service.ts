import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { MateriaPrimaLavorazione } from '../models/materiaprima-lavorazione';
import { MateriaPrima } from '../models/materiaprima';
import { MateriaPrimaTS } from '../models/materiaprima-ts';
import { MateriaPrimaMappingTS } from '../models/materiaprima-mapping';

@Injectable({
  providedIn: 'root'
})
export class MateriePrimeService {
  constructor(private http: HttpClient) {}

  findAllMateriePrimeLavorazioni(): Observable<Array<MateriaPrimaLavorazione>> {
    return this.http.get<Array<MateriaPrimaLavorazione>>(
      `${environment.apiUrl}/materie_prime/lavorazioni`
    );
  }

  findAllMateriePrime(): Observable<Array<MateriaPrima>> {
    return this.http.get<Array<MateriaPrima>>(`${environment.apiUrl}/materie_prime`);
  }

  findAllMateriePrimeTS(): Observable<Array<MateriaPrimaTS>> {
    return this.http.get<Array<MateriaPrimaTS>>(`${environment.apiUrl}/materie_prime/ts`);
  }

  findAllMapping(): Observable<Array<MateriaPrimaMappingTS>> {
    return this.http.get<Array<MateriaPrimaMappingTS>>(
      `${environment.apiUrl}/tabella_mapping_materie_prime`
    );
  }

  saveMapping(materie_prime_mapping: any): Observable<Object> {
    return this.http.post(
      `${environment.apiUrl}/tabella_mapping_materie_prime`,
      materie_prime_mapping
    );
  }

  deleteMapping(id: string) {
    return this.http.delete(`${environment.apiUrl}/tabella_mapping_materie_prime/${id}`);
  }
}
