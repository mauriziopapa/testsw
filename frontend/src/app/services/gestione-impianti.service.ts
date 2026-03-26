import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GestioneImpiantiService {
  constructor(private http: HttpClient) {}

  getData(anno: string, mese: string): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/tabella_gestione_impianti?anno=${anno}&mese=${mese}`
    );
  }

  getDataIND(anno: string, mese: string): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/tabella_gestione_impianti_ind?anno=${anno}&mese=${mese}`
    );
  }

  getDataFVF(anno: string, mese: string): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/tabella_gestione_impianti_fvf?anno=${anno}&mese=${mese}`
    );
  }

  postData(
    impianti: any,
    valoriKpiCalcolati: Map<string, number>,
    kpiCalcolatiForzatiManualmente: Map<string, boolean>,
    anno: string,
    mese: string,
  ) {
    const kpi_produzione = this.buildbody(valoriKpiCalcolati, kpiCalcolatiForzatiManualmente, anno, mese);
    // vanno inviati i dati per i kpi di produzione dei reparti singoli
    // + i kpi di produzione per i reparti che hanno le somme calcolate
    const body =  { impianti, kpi_produzione }
    const url =  `${environment.apiUrl}/tabella_gestione_impianti`
    return this.http.post<any>(url, body);
  }

  postDataIND(
    impianti: any,
    valoriKpiCalcolati: Map<string, number>,
    kpiCalcolatiForzatiManualmente: Map<string, boolean>,
    anno: string,
    mese: string,
    dipendenti:any,
  ) {
    const kpi_produzione = this.buildbody(valoriKpiCalcolati, kpiCalcolatiForzatiManualmente, anno, mese);
    // vanno inviati i dati per i kpi di produzione dei reparti singoli
    // + i kpi di produzione per i reparti che hanno le somme calcolate
    const body =  { impianti, kpi_produzione,dipendenti,anno,mese } 
    const url = `${environment.apiUrl}/tabella_gestione_impianti_ind` 
    return this.http.post<any>(url, body);
  }




  private buildbody(valoriKpiCalcolati: Map<string, number>, kpiCalcolatiForzatiManualmente: Map<string, boolean>, anno: string, mese: string) {
    const kpi_produzione = new Array<any>();
    // sempre perche' avevo poco tempo
    valoriKpiCalcolati.forEach((val, key) => {
      let kpi = key.split('somma')[1];
      let reparto = '';
      if (kpi.includes('NCV Cieffe')) {
        reparto = 'NCV Cieffe';
        kpi = kpi.split('NCV Cieffe')[1];
      }
      if (kpi.includes('NCV Ipsen')) {
        reparto = 'NCV Ipsen';
        kpi = kpi.split('NCV Ipsen')[1];
      }
      if (kpi.includes('LLF')) {
        reparto = 'LLF';
        kpi = kpi.split('LLF')[1];
      }
      if (kpi.includes('TV')) {
        reparto = 'TV';
        kpi = kpi.split('TV')[1];
      }
      if (kpi.includes('ALU')) {
        reparto = 'ALU';
        kpi = kpi.split('ALU')[1];
      }
      if (kpi.includes('IND')) {
        reparto = 'IND';
        kpi = kpi.split('IND')[1];
      }
      if (kpi.includes('FVF') && !kpi.includes('FVF-SZ')) {
        reparto = 'FVF';
        kpi = kpi.split('FVF')[1];
      }
      if (kpi.includes('FVF-SZ')) {
        reparto = 'FVF-SZ';
        kpi = kpi.split('FVF-SZ')[1];
      }
      // workaroud per far uscire il quadrato arancione su ore cartellino induzione
      // dopo che mi hanno chiesto la forzatura manuale
      // non mi piace ma non ho tempo
      if (kpiCalcolatiForzatiManualmente?.has(key)) {
        const forzatura_manuale = kpiCalcolatiForzatiManualmente.get(key);
        kpi_produzione.push({ kpi, reparto, val, forzatura_manuale, anno, mese });
      } else {
        kpi_produzione.push({ kpi, reparto, val, anno, mese });
      }
    });
    return kpi_produzione;
  }
}
