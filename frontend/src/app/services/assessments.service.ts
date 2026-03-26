import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Filters } from '../models/filters';

import { HttpClient } from '@angular/common/http';
import { AssessmentOption } from '../models/assessmentOption';
import { Assessment } from '../models/assessment';

@Injectable({
  providedIn: 'root'
})
export class AssessmentsService {
  constructor(private http: HttpClient) {}

  getAssessmentList(): Observable<Array<AssessmentOption>> {
    return this.http.get<Array<any>>(`${environment.apiUrl}/assessments`);
  }

  getAssessment(
    anno: number,
    trimestre: string,
    dashboard: string,
    dashboard_instance: number
  ): Observable<Array<Assessment>> {
    return this.http.get<Array<any>>(
      `${environment.apiUrl}/assessments/${anno}?trimestre=${trimestre}&dashboard=${dashboard}&dashboard_instance=${dashboard_instance}`
    );
  }

  saveScreenshot(formData: FormData): Observable<Object> {
    return this.http.post(`${environment.apiUrl}/assessments/screenshot`, formData);
  }

  saveAssessment(assessments: Array<Assessment>): Observable<Object> {
    return this.http.put(`${environment.apiUrl}/assessments`, assessments);
  }

  exportAssessment(anno: number, trimestre: string, dashboard: number, dashboard_instance: number) {
    window.open(
      `${environment.apiUrl}/assessments/export/${anno}/${trimestre}/${dashboard}/${dashboard_instance}`
    );
  }
}
