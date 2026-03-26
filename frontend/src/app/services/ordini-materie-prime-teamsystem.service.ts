import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { TeamsystemOrdiniMateriePrime } from '../models/teamsystem-ordini-materie-prime';

@Injectable({
  providedIn: 'root'
})
export class OrdiniMateriePrimeTeamSystemService {
  constructor(private http: HttpClient) {}

  findAllOrdiniMateriePrime(anno: number): Observable<Array<TeamsystemOrdiniMateriePrime>> {
    return this.http.get<Array<TeamsystemOrdiniMateriePrime>>(
      `${environment.apiUrl}/tabella_teamsystem_ordini_materieprime?anno=${anno}`
    );
  }
}
