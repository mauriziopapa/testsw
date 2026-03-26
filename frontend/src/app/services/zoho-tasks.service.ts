import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ZohoTask } from '../models/zoho-task';

@Injectable({
  providedIn: 'root'
})
export class ZohoTasksService {
  constructor(private http: HttpClient) {}

  findAll(anno: number): Observable<Array<ZohoTask>> {
    return this.http.get<Array<ZohoTask>>(`${environment.apiUrl}/tabella_zoho_tasks?anno=${anno}`);
  }
}
