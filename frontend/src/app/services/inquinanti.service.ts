import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { Inquinante } from '../models/inquinante';

@Injectable({
  providedIn: 'root'
})
export class InquinantiService {
  constructor(private http: HttpClient) {}

  getInquinanti(): Observable<Array<Inquinante>> {
    return this.http.get<Array<Inquinante>>(`${environment.apiUrl}/inquinanti`);
  }
}
