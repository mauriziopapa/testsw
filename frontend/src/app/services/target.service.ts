import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Target } from '../models/target';

@Injectable({
  providedIn: 'root'
})
export class TargetService {
  constructor(private http: HttpClient) {}

  getTarget(widget: string, anno: number): Observable<Target> {
    return this.http.get<Target>(`${environment.apiUrl}/target/${widget}/${anno}`);
  }

  saveTarget(target: Target): Observable<Object> {
    return this.http.post(`${environment.apiUrl}/target`, target);
  }
}
