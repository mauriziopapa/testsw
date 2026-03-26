import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { CommesseNc } from '../models/commesse-nc';

@Injectable({
  providedIn: 'root'
})
export class CommesseNcService {
  constructor(private http: HttpClient) {}

  findAll(anno: number): Observable<Array<CommesseNc>> {
    return this.http.get<Array<CommesseNc>>(
      `${environment.apiUrl}/tabella_commesse_nc?anno=${anno}`
    );
  }
}
