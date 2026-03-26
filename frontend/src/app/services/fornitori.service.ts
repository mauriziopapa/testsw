import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { ClienteFatturato } from '../models/cliente-fatturato';
import { CostoFornitore } from '../models/costo-fornitore';
import { AumentoMpFornitore } from '../models/aumento-mp-fornitore';

@Injectable({
  providedIn: 'root'
})
export class FornitoriService {
  constructor(private http: HttpClient) {}

  findAllFornitori(): Observable<Array<CostoFornitore>> {
    return this.http.get<Array<CostoFornitore>>(`${environment.apiUrl}/tabella_costo_fornitori`);
  }

  findAumentoMpFornitori(): Observable<Array<AumentoMpFornitore>> {
    return this.http.get<Array<AumentoMpFornitore>>(
      `${environment.apiUrl}/tabella_aumento_mp_fornitori`
    );
  }
}
