import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { HrDipendentiTeamsystem } from '../models/teamsystem-hr-dipendenti';

@Injectable({
  providedIn: 'root'
})
export class HrDipendentiTeamsystemService {
  constructor(private http: HttpClient) {}

  findAll(aziendaId:string): Observable<Array<HrDipendentiTeamsystem>> {
    return this.http.get<Array<HrDipendentiTeamsystem>>(
      `${environment.apiUrl}/tabella_teamsystem_hr_dipendenti?aziendaId=${aziendaId}`
    );
  }
}
