import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { FormArray } from '@angular/forms';
import { map } from 'rxjs/operators';
import { RifiutoProdotto } from '../models/rifiuto-prodotto';
import { Rifiuto } from '../models/rifiuto';
import { RifiutoLavorazione } from '../models/rifiuto-lavorazione';

@Injectable({
  providedIn: 'root'
})
export class RifiutiService {
  constructor(private http: HttpClient) {}

  getRifiuti(): Observable<Array<Rifiuto>> {
    return this.http.get<Array<Rifiuto>>(`${environment.apiUrl}/rifiuti`);
  }

  findAllRifiutiProdotti(year: string): Observable<Array<RifiutoProdotto>> {
    return this.http.get<Array<RifiutoProdotto>>(
      `${environment.apiUrl}/tabella_rifiuti_prodotti?anno=${year}`
    );
  }

  findAllRifiutiLavorazioni(): Observable<Array<RifiutoLavorazione>> {
    return this.http.get<Array<RifiutoLavorazione>>(`${environment.apiUrl}/rifiuti/lavorazioni`);
  }

  saveRifiuti(rifiuti: Array<RifiutoProdotto>): Observable<Object> {
    return this.http.post(`${environment.apiUrl}/tabella_rifiuti_prodotti`, rifiuti);
  }

  deleteRifiuti(id: string): Observable<Object> {
    return this.http.delete(`${environment.apiUrl}/tabella_rifiuti_prodotti/${id}`);
  }
}
