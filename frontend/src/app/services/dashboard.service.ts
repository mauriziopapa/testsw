import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  cols = 3;
  colWidth = 0;

  constructor(private http: HttpClient) {}

  updateDashboardColumns(dashboardId: number, columns: string): Observable<Object> {
    this.cols = parseInt(columns);
    return this.http.patch(`${environment.apiUrl}/dashboards/${dashboardId}/columns`, { columns });
  }

  setCols(cols: number) {
    this.cols = cols;
  }

  getCols(): number {
    return this.cols;
  }

  setColWidth(width: number) {
    this.colWidth = width;
  }

  getColWidth(): number {
    return this.colWidth;
  }
}
