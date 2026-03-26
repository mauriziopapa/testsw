import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { ReportResaCaricaMedia } from '../models/report-resa-carica-media';

@Injectable({
  providedIn: 'root'
})
export class ResaCaricaMediaService {
  constructor(private http: HttpClient) {}

  get(year: string, reparto: string): Observable<Array<ReportResaCaricaMedia>> {
    return this.http.get<Array<ReportResaCaricaMedia>>(
      `${environment.apiUrl}/kpi/resa_carica_media/report?anno=${year}&reparto=${reparto}`
    );
  }
}
