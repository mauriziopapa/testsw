import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { OreFormazione } from '../models/ore-formazione';

@Injectable({
  providedIn: 'root'
})
export class OreFormazioneService {
  constructor(private http: HttpClient) {}

  findAll(): Observable<Array<OreFormazione>> {
    return this.http.get<Array<OreFormazione>>(`${environment.apiUrl}/tabella_ore_formazione`);
  }
}
