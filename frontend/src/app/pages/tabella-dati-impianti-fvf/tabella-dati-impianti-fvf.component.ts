import { Component } from '@angular/core';
import { GestioneImpiantiService } from 'src/app/services/gestione-impianti.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SuccessSnackbarComponent } from 'src/app/shared/success-snackbar/success-snackbar.component';
import { TableFilters } from 'src/app/models/table-filters';
import { FailSnackbarComponent } from 'src/app/shared/fail-snackbar/fail-snackbar.component';

@Component({
  selector: 'tabella-dati-impianti-fvf',
  templateUrl: './tabella-dati-impianti-fvf.component.html',
  styleUrls: ['./tabella-dati-impianti-fvf.component.scss']
})
export class TabellaDatiImpiantiFVFComponent {
  tableName = 'tabella-impianti-fvf';

  mesi = new Array<string>();
  impianti: any;
  kpi_rows: any;

  forced = false;

  tableFilters = new TableFilters();

  // serve per lo switch nel template
  nomiKpiCalcolati = new Map<string, string>();
  valoriKpiSommaReparti = new Map<string, number>();
  valoriKpiCalcolati = new Map<string, number>();
  kpiCalcolatiForzatiManualmente = new Map<string, boolean>();

  // posizionale in base alla risposta del server
  divFVF = [0, 1, 2, 3];
  divFVFSZ = [4];

  constructor(
    private gestioneImpiantiService: GestioneImpiantiService,
    private snackBar: MatSnackBar
  ) {}

  searchByTableFilters(tableFilters: any) {
    this.resetVariabili(tableFilters);

    this.gestioneImpiantiService
      .getDataFVF(tableFilters.tableYear, tableFilters.tableMonth)
      .subscribe((response) => {
        // Prendo il mese per l'intestazione delle righe
        this.mesi = response.mesi.map((m: any) => m.nome_mese);
        // Prendo gli impianti (centri di lavoro) per creare le colonne
        this.impianti = response.impianti;

        // Qui ci sono i valori per ogni impianto
        this.kpi_rows = response.kpi_rows;
        this.calcolaSommaReparti();
      });
  }

  calcolaSommaReparti(): void {
    this.kpi_rows.forEach((kpi: any) => {
      // Inserisco nella mappa i valori somma dei centri di lavoro per ogni kpi
      // l'id è l'id del kpi, che equivale al kpi del centro di lavoro (impianto)
      this.valoriKpiSommaReparti.set(`FVF${kpi.id}`, 0);
      this.valoriKpiSommaReparti.set(`FVF-SZ${kpi.id}`, 0);

      // sommo i singoli valori per ottenere i valori somma
      kpi.valori.forEach((valore: any) => {
        const impianto = this.impianti.find((i: any) => i.id === valore.fk_impianto);
        const key = `${impianto.gruppo_impianto}${kpi.id}`;
        let val = this.valoriKpiSommaReparti.get(key) || 0;
        val += valore.valore ? parseFloat(valore.valore) : 0;
        this.valoriKpiSommaReparti.set(key, val);
      });

      // Inserisco nella mappa dei kpi calcolati i nomi dei kpi che sono derivati da un calcolo
      if (kpi.calcolato) {
        this.nomiKpiCalcolati.set(kpi.nome_kpi, kpi.nome_kpi);

        // se il dato arriva già dal server non lo ricalcolo
        if (kpi.valori.length > 0) {
          const impianto = this.impianti.find((i: any) => i.id === kpi.valori[0].fk_impianto);
          kpi.valori.forEach((v: any) => {
            if (v.reparto) {
              const key = `${v.reparto}${kpi.id}`;
              this.valoriKpiCalcolati.set(`somma${key}`, v.val);
            }
          });
        } else {
          this.calcKpi(kpi, 'FVF');
          this.calcKpi(kpi, 'FVF-SZ');
        }
      }
    });
  }

  calcKpi(kpi: any, gruppoLavoro: string) {
    this.valoriKpiSommaReparti;
    switch (kpi.id) {
      case 14: //Ore Acceso
        this.calcKpi14(kpi.id, gruppoLavoro);
        break;
      case 24: //Ore funzionamento effettivo di controllo
        this.calcKpi24(kpi.id, gruppoLavoro);
        break;
      case 27: //Ore produttive
        this.calcKpi27(kpi.id, gruppoLavoro);
        break;
      case 15: //OEE
        this.calcKpi15(kpi.id, gruppoLavoro);
        break;
      case 28: //Capacità Pratica
        this.calcKpi28(kpi.id, gruppoLavoro);
        break;
      case 1: //Efficienza produttiva
        this.calcKpi1(kpi.id, gruppoLavoro);
        break;
      case 29: //Tasso Qualita
        this.calcKpi29(kpi.id, gruppoLavoro);
        break;
      case 3: //Equipment Availability
        this.calcKpi3(kpi.id, gruppoLavoro);
        break;
      case 33: //Efficacia manutenzione
        this.calcKpi33(kpi.id, gruppoLavoro);
        break;
      case 4: ///Saturazione commerciale
        this.calcKpi4(kpi.id, gruppoLavoro);
        break;
      default:
        break;
    }
  }

  calcKpi1(id: any, gruppoLavoro: string): void {
    const ore_funz_eff = this.valoriKpiSommaReparti.get(`${gruppoLavoro}30`) || 0;
    const ore_acceso = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}14`) || 0;
    let val = '0';
    if (ore_acceso > 0) {
      val = (ore_funz_eff / ore_acceso).toFixed(3);
    }
    this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, parseFloat(val));
  }

  calcKpi3(id: any, gruppoLavoro: string): void {
    const spento_manutenzione = this.valoriKpiSommaReparti.get(`${gruppoLavoro}5`) || 0;
    const spento_manstrao = this.valoriKpiSommaReparti.get(`${gruppoLavoro}6`) || 0;
    const standby_manstrao = this.valoriKpiSommaReparti.get(`${gruppoLavoro}7`) || 0;
    const capacita_teorica = this.valoriKpiSommaReparti.get(`${gruppoLavoro}31`) || 0;
    const val = (
      1 -
      (spento_manutenzione + spento_manstrao + standby_manstrao) / capacita_teorica
    ).toFixed(3);
    this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, parseFloat(val));
  }

  calcKpi14(id: any, gruppoLavoro: string): void {
    const capacita_teorica = this.valoriKpiSommaReparti.get(`${gruppoLavoro}31`) || 0;
    const spento_no_materiale = this.valoriKpiSommaReparti.get(`${gruppoLavoro}21`) || 0;
    const spento_manutenzione = this.valoriKpiSommaReparti.get(`${gruppoLavoro}5`) || 0;
    const manutenzione_straord = this.valoriKpiSommaReparti.get(`${gruppoLavoro}6`) || 0;
    const festivita = this.valoriKpiSommaReparti.get(`${gruppoLavoro}20`) || 0;
    const val =
      capacita_teorica -
      spento_no_materiale -
      spento_manutenzione -
      manutenzione_straord -
      festivita;
    this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, val);
  }

  calcKpi24(id: any, gruppoLavoro: string): void {
    const capacita_teorica = this.valoriKpiSommaReparti.get(`${gruppoLavoro}31`) || 0;
    const spento_no_materiale = this.valoriKpiSommaReparti.get(`${gruppoLavoro}21`) || 0;
    const spento_manutenzione = this.valoriKpiSommaReparti.get(`${gruppoLavoro}5`) || 0;
    const manutenzione_straord = this.valoriKpiSommaReparti.get(`${gruppoLavoro}6`) || 0;
    const festivita = this.valoriKpiSommaReparti.get(`${gruppoLavoro}20`) || 0;
    const ore_standby_nomateriale = this.valoriKpiSommaReparti.get(`${gruppoLavoro}22`) || 0;
    const ore_standby_nomanopera = this.valoriKpiSommaReparti.get(`${gruppoLavoro}23`) || 0;
    const ore_standby_manstrao = this.valoriKpiSommaReparti.get(`${gruppoLavoro}7`) || 0;
    const val =
      capacita_teorica -
      spento_no_materiale -
      spento_manutenzione -
      manutenzione_straord -
      festivita -
      ore_standby_nomateriale -
      ore_standby_nomanopera -
      ore_standby_manstrao;
    this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, val);
  }

  calcKpi27(id: any, gruppoLavoro: string): void {
    const ore_funz_eff = this.valoriKpiSommaReparti.get(`${gruppoLavoro}30`) || 0;
    const ore_rilavorazioni = this.valoriKpiSommaReparti.get(`${gruppoLavoro}25`) || 0;
    const ore_campionature = this.valoriKpiSommaReparti.get(`${gruppoLavoro}26`) || 0;
    const val = ore_funz_eff - ore_rilavorazioni - ore_campionature;
    this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, val);
  }

  calcKpi28(id: any, gruppoLavoro: string): void {
    const capacita_teorica = this.valoriKpiSommaReparti.get(`${gruppoLavoro}31`) || 0;
    const ore_acceso = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}14`) || 0;
    const val = (ore_acceso / capacita_teorica).toFixed(3);
    this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, parseFloat(val));
  }

  calcKpi4(id: any, gruppoLavoro: string): void {
    const capacita_teorica = this.valoriKpiSommaReparti.get(`${gruppoLavoro}31`) || 0;
    const spento_no_materiale = this.valoriKpiSommaReparti.get(`${gruppoLavoro}21`) || 0;
    const spento_manutenzione = this.valoriKpiSommaReparti.get(`${gruppoLavoro}5`) || 0;
    const spento_manstrao = this.valoriKpiSommaReparti.get(`${gruppoLavoro}6`) || 0;
    const festivita = this.valoriKpiSommaReparti.get(`${gruppoLavoro}20`) || 0;
    const val = (
      (capacita_teorica - spento_no_materiale - spento_manutenzione - spento_manstrao - festivita) /
      capacita_teorica
    ).toFixed(2);
    this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, parseFloat(val));
  }

  calcKpi15(id: any, gruppoLavoro: string): void {
    const tasso_qualita = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}29`) || 0;
    const eff_prod = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}1`) || 0;
    const aviability = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}3`) || 0;

    const val = (tasso_qualita * eff_prod * aviability).toFixed(3);
    this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, parseFloat(val));
  }

  calcKpi33(id: any, gruppoLavoro: string): void {
    const ore_standby_guasto = this.valoriKpiSommaReparti.get(`${gruppoLavoro}7`) || 0;
    const ore_acceso = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}14`) || 0;
    const val = (1 - ore_standby_guasto / ore_acceso).toFixed(3);
    this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, parseFloat(val));
  }

  calcKpi29(id: any, gruppoLavoro: string): void {
    const ore_produttive = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}27`) || 0;
    const ore_funz_eff = this.valoriKpiSommaReparti.get(`${gruppoLavoro}30`) || 0;
    let val = '0';
    if (ore_funz_eff > 0) {
      val = (ore_produttive / ore_funz_eff).toFixed(3);
    }
    this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, parseFloat(val));
  }

  inputChanged(kpi: any, gruppoLavoro: string, row: any) {
    // il dato è stato cambiato quindi è una forzatura
    row.forzatura_manuale = true;
    if (row.valore == '0') {
      // se è stato reinserito 0 resettiamo la forzatura
      row.forzatura_manuale = false;
    }
    // display alert
    this.forced = true;
    let val = 0;
    // è stato cambiato l'input, quindi devo ricalcolare il valore
    kpi.valori.forEach((valore: any) => {
      // Scorro tutti i valori degli impianti perchè non so quali corrispondono
      // a quello che mi interessa, ma devo aggiornare solo gli impianti LLF
      const impianto = this.impianti.find((i: any) => i.id === valore.fk_impianto);
      if (impianto.gruppo_impianto === gruppoLavoro) {
        const key = `${impianto.gruppo_impianto}${kpi.id}`;
        // azzero la somma calcolata inizialmente
        this.valoriKpiSommaReparti.set(key, val);
        // la incremento con i nuovi valori
        val += valore.valore ? parseFloat(valore.valore) : 0;
        // la aggiorno
        this.valoriKpiSommaReparti.set(key, val);
      }
    });

    // aggiorno anche i kpi calcolati
    this.kpi_rows.forEach((kpi: any) => {
      if (kpi.calcolato) {
        this.calcKpi(kpi, gruppoLavoro);
        this.calcKpi(kpi, gruppoLavoro);
      }
    });
  }

  onSubmit() {
    this.gestioneImpiantiService
      .postData(
        this.kpi_rows,
        this.valoriKpiCalcolati,
        this.kpiCalcolatiForzatiManualmente,
        this.tableFilters.year,
        this.tableFilters.month
      )
      .subscribe({
        next: () => {
          this.openSuccessSnackBar();
        },
        error: (err) => {
          this.openFailSnackBar();
        }
      });
  }

  private resetVariabili(tableFilters: any) {
    this.tableFilters.year = tableFilters.tableYear;
    this.tableFilters.month = tableFilters.tableMonth;

    this.nomiKpiCalcolati = new Map<string, string>();
    this.valoriKpiSommaReparti = new Map<string, number>();
    this.valoriKpiCalcolati = new Map<string, number>();
  }

  private openFailSnackBar() {
    this.snackBar.openFromComponent(FailSnackbarComponent, {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: ['failUpdated']
    });
  }

  private openSuccessSnackBar() {
    this.snackBar.openFromComponent(SuccessSnackbarComponent, {
      duration: 1000,
      verticalPosition: 'top',
      panelClass: ['successUpdated']
    });
  }
}
