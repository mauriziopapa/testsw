import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { Emissione } from '../models/emissione';
import { FormArray } from '@angular/forms';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmissioniService {
  constructor(private http: HttpClient) {}

  findAll(anno: string, mese: string): Observable<Array<Emissione>> {
    return this.http.get<Array<Emissione>>(
      `${environment.apiUrl}/emissioni?anno=${anno}&mese=${mese}`
    );
  }

  saveEmissioni(emissioni: any): Observable<Object> {
    return this.http.post(`${environment.apiUrl}/emissioni`, emissioni);
  }

  deleteEmissione(id: string): Observable<Object> {
    return this.http.delete(`${environment.apiUrl}/emissioni/${id}`);
  }
}
