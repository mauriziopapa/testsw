import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { BudgetTable } from '../models/budget-table';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  constructor(private http: HttpClient) {}

  findBudget(year: string): Observable<Array<BudgetTable>> {
    return this.http.get<Array<BudgetTable>>(`${environment.apiUrl}/tabella_budget?anno=${year}`);
  }

  saveBudget(budget: Array<BudgetTable>): Observable<Object> {
    return this.http.post(`${environment.apiUrl}/tabella_budget`, budget);
  }
}
