import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { TimbrateNc } from '../models/timbrate-nc';

@Injectable({
  providedIn: 'root'
})
export class TimbrateNcService {
  constructor(private http: HttpClient) {}

  findAll(anno: number): Observable<Array<TimbrateNc>> {
    return this.http.get<Array<TimbrateNc>>(
      `${environment.apiUrl}/tabella_timbrate_nc?anno=${anno}`
    );
  }
}
