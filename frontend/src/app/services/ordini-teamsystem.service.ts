import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { TeamsystemOrdini } from '../models/teamsystem-ordini';

@Injectable({
  providedIn: 'root'
})
export class OrdiniTeamSystemService {
  constructor(private http: HttpClient) {}

  findAllOrdini(anno: number): Observable<Array<TeamsystemOrdini>> {
    return this.http.get<Array<TeamsystemOrdini>>(
      `${environment.apiUrl}/tabella_teamsystem_ordini?anno=${anno}`
    );
  }
}
