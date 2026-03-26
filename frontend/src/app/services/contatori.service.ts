import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { FormArray } from '@angular/forms';
import { map } from 'rxjs/operators';
import { ContatoreMisurazione } from '../models/contatore-misurazione';
import { Contatore } from '../models/contatore';
import { ContatoreLavorazione } from '../models/contatore-lavorazione';

@Injectable({
  providedIn: 'root'
})
export class ContatoriService {
  constructor(private http: HttpClient) {}

  getContatori(): Observable<Array<Contatore>> {
    return this.http.get<Array<Contatore>>(`${environment.apiUrl}/contatori`);
  }

  findAllContatoriMisurazioni(year: string): Observable<Array<ContatoreMisurazione>> {
    return this.http.get<Array<ContatoreMisurazione>>(
      `${environment.apiUrl}/tabella_contatori_misurazioni?anno=${year}`
    );
  }

  findAllContatoriLavorazioni(): Observable<Array<ContatoreLavorazione>> {
    return this.http.get<Array<ContatoreLavorazione>>(
      `${environment.apiUrl}/contatori/lavorazioni/`
    );
  }

  saveContatoriMisurazioni(contatori: Array<ContatoreMisurazione>): Observable<Object> {
    return this.http.post(`${environment.apiUrl}/tabella_contatori_misurazioni`, contatori);
  }

  deleteMisurazione(id: string): Observable<Object> {
    return this.http.delete(`${environment.apiUrl}/tabella_contatori_misurazioni/${id}`);
  }
}
