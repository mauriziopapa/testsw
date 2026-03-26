import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { RiepilogoCliente } from '../models/riepilogo-cliente';

@Injectable({
  providedIn: 'root'
})
export class RiepilogoClientiService {
  constructor(private http: HttpClient) {}

  findAllClienti(anno:number): Observable<Array<RiepilogoCliente>> {
    return this.http.get<Array<RiepilogoCliente>>(
      `${environment.apiUrl}/tabella_riepilogo_clienti?anno=${anno}`
    );
  }
}
