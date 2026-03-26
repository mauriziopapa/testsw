import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContatoreMetano } from '../models/contatore-metano';
import { environment } from 'src/environments/environment';
import { ContatoreMisurazioneMetano } from '../models/contatore-misurazione-metano';
import { ContatoreLavorazione } from '../models/contatore-lavorazione';

@Injectable({
  providedIn: 'root'
})
export class MetanoService {
  constructor(private http: HttpClient) {}

  getContatori(): Observable<Array<ContatoreMetano>> {
    return this.http.get<Array<ContatoreMetano>>(`${environment.apiUrl}/contatori_metano`);
  }

  findAllContatoriMisurazioni(year: string): Observable<Array<ContatoreMisurazioneMetano>> {
    return this.http.get<Array<ContatoreMisurazioneMetano>>(
      `${environment.apiUrl}/tabella_contatori_misurazioni_metano?anno=${year}`
    );
  }

  findAllContatoriLavorazioni(): Observable<Array<ContatoreLavorazione>> {
    return this.http.get<Array<ContatoreLavorazione>>(
      `${environment.apiUrl}/contatori/lavorazioni/`
    );
  }

  saveContatoriMisurazioni(contatori: Array<ContatoreMisurazioneMetano>): Observable<Object> {
    return this.http.post(`${environment.apiUrl}/tabella_contatori_misurazioni_metano`, contatori);
  }

  deleteMisurazione(id: string): Observable<Object> {
    return this.http.delete(`${environment.apiUrl}/tabella_contatori_misurazioni_metano/${id}`);
  }
  

}
