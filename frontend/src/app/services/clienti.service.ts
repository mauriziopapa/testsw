import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { ClienteFatturato } from '../models/cliente-fatturato';

@Injectable({
  providedIn: 'root'
})
export class ClientiService {
  constructor(private http: HttpClient) {}

  findAllClienti(): Observable<Array<ClienteFatturato>> {
    return this.http.get<Array<ClienteFatturato>>(
      `${environment.apiUrl}/tabella_fatturato_clienti`
    );
  }
}
