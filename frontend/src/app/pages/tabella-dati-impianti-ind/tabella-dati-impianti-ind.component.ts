import { Component } from '@angular/core';
import { GestioneImpiantiService } from 'src/app/services/gestione-impianti.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SuccessSnackbarComponent } from 'src/app/shared/success-snackbar/success-snackbar.component';
import { TableFilters } from 'src/app/models/table-filters';
import { FailSnackbarComponent } from 'src/app/shared/fail-snackbar/fail-snackbar.component';

// qui avevo pochissimo tempo
@Component({
    selector: 'tabella-dati-impianti-ind',
    templateUrl: './tabella-dati-impianti-ind.component.html',
    styleUrls: ['./tabella-dati-impianti-ind.component.scss'],
    standalone: false
})
export class TabellaDatiImpiantiIndComponent {
  tableName = 'tabella-impianti-ind';

  mesi = new Array<string>();
  impianti: any;
  kpi_rows: any;

  forced = false;

  tableFilters = new TableFilters();

  dipendenti = {
    "dipendentiChangeFlag":false,
    "value":"0"
  };
  

  // serve per lo switch nel template
  nomiKpiCalcolati = new Map<string, string>();
  valoriKpiSommaReparti = new Map<string, number>();
  valoriKpiCalcolati = new Map<string, number>();
  kpiCalcolatiForzatiManualmente = new Map<string, boolean>();


  // posizionale in base alla risposta del server
  divIND = [0, 1, 2, 3];

  constructor(
    private gestioneImpiantiService: GestioneImpiantiService,
    private snackBar: MatSnackBar
  ) {}

  searchByTableFilters(tableFilters: any) {
    this.resetVariabili(tableFilters);

    this.gestioneImpiantiService
      .getDataIND(tableFilters.tableYear, tableFilters.tableMonth)
      .subscribe((response) => {
        // Prendo il numero di dipendenti
        this.dipendenti = {
          "value":response.dipendenti,
          "dipendentiChangeFlag":false};

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
      this.valoriKpiSommaReparti.set(`IND${kpi.id}`, 0);

      // sommo i singoli valori per ottenere i valori somma
      kpi.valori.forEach((valore: any) => {
        const impianto = this.impianti.find((i: any) => i.id === valore.fk_impianto);
        const key = `${impianto.gruppo_impianto}${kpi.id}`;
        let val = this.valoriKpiSommaReparti.get(key) || 0;
        val += valore.valore ? parseInt(valore.valore) : 0;
        this.valoriKpiSommaReparti.set(key, val);
      });

      // Inserisco nella mappa dei kpi calcolati i nomi dei kpi che sono derivati da un calcolo
      if (kpi.calcolato) {
        this.nomiKpiCalcolati.set(kpi.nome_kpi, kpi.nome_kpi);

        // se il dato arriva già dal server non lo ricalcolo
        if (kpi.valori.length > 0) {
          const val = kpi.valori[0].val;
          this.valoriKpiCalcolati.set(`sommaIND${kpi.id}`, val);
        } else {
          this.calcKpi(kpi, 'IND');
        }
      }
    });
  }

  calcKpi(kpi: any, gruppoLavoro: string) {
    switch (kpi.id) {
      case 1: //Efficienza produttiva
        this.calcKpi1(kpi.id, gruppoLavoro);
        break;
      case 3: //Equipment Availability
        this.calcKpi3(kpi.id, gruppoLavoro);
        break;
      case 4: //Saturazione commerciale
        this.calcKpi4(kpi.id, gruppoLavoro);
        break;
      case 8: //Mancanza personale
        this.calcKpi8(kpi.id,gruppoLavoro)
        break
      case 21: //Ore spento per mancanza materiale (campo di controllo)
        this.calcKpi21(kpi.id, gruppoLavoro);
        break;
      case 15: //OEE
        this.calcKpi15(kpi.id, gruppoLavoro);
        break;
      case 27: //Ore produttive
        this.calcKpi27(kpi.id, gruppoLavoro);
        break;
      case 28: //Capacità Pratica
        this.calcKpi28(kpi.id, gruppoLavoro);
        break;
      case 29: //Tasso Qualita
        this.calcKpi29(kpi.id, gruppoLavoro);
        break;
      case 55: //Altre perdite (campo di controllo)
        this.calcKpi55(kpi.id, gruppoLavoro);
        break;
      default:
        break;
    }
  }

  // Efficienza produttiva
  calcKpi1(id: any, gruppoLavoro: string): void {
    const ore_funz_eff = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}24`) || 0;
    const guasto = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}51`) || 0;
    const ore_acceso = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}14`) || 0;
    if (ore_acceso > 0) {
      const val = ((ore_funz_eff + guasto) / ore_acceso).toFixed(3);
      this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, parseFloat(val));
    } else {
      this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, 0);
    }
  }

  // Equipment Availability
  calcKpi3(id: any, gruppoLavoro: string): void {
    const spento_manutenzione = this.valoriKpiSommaReparti.get(`${gruppoLavoro}5`) || 0;
    const manutenzione_straord = this.valoriKpiSommaReparti.get(`${gruppoLavoro}6`) || 0;
    const guasto = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}51`) || 0;
    const capacita_teorica = this.valoriKpiSommaReparti.get(`${gruppoLavoro}31`) || 0;
    if (capacita_teorica > 0) {
      const val = (
        1 -
        (spento_manutenzione + manutenzione_straord + guasto) / capacita_teorica
      ).toFixed(3);
      this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, parseFloat(val));
    } else {
      this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, 0);
    }
  }
  
  //Mancanza Personale
  calcKpi8(id: any, gruppoLavoro: string): void {
    const dipendenti = this.dipendenti.value;
    const ore_cartellini = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}14`) || 0;
    const val = (22*8*parseFloat(dipendenti)) - ore_cartellini

    this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`,val);   
  }

  // Mancanza Materiale (campo di controllo)
  calcKpi21(id: any, gruppoLavoro: string): void {
    const capacita_teorica = this.valoriKpiSommaReparti.get(`${gruppoLavoro}31`) || 0;
    const festivita = this.valoriKpiSommaReparti.get(`${gruppoLavoro}20`) || 0;
    const no_personale = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}8`) || 0;
    const manutenzione_prog = this.valoriKpiSommaReparti.get(`${gruppoLavoro}5`) || 0;
    const manutenzione_straord = this.valoriKpiSommaReparti.get(`${gruppoLavoro}6`) || 0;
    const ore_campionature = this.valoriKpiSommaReparti.get(`${gruppoLavoro}26`) || 0;
    const ore_acceso = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}14`) || 0;

    const val =
      capacita_teorica -
      festivita -
      no_personale -
      manutenzione_prog -
      manutenzione_straord -
      ore_campionature -
      ore_acceso;
    this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, val);
  }

  // Altre perdite (campo di controllo)
  calcKpi55(id: any, gruppoLavoro: string): void {
    const ore_acceso = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}14`) || 0;
    const ore_funz_eff = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}24`) || 0;
    const messa_a_punto = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}46`) || 0;
    const costr_ind = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}47`) || 0;
    const rit_laboratorio = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}48`) || 0;
    const no_energia = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}49`) || 0;
    const tempi_pulizia = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}50`) || 0;
    const guasto = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}51`) || 0;
    const tempo_protezioni = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}52`) || 0;
    const tempo_cricche = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}53`) || 0;
    const altre_attivita = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}54`) || 0;

    const val =
      ore_acceso -
      ore_funz_eff -
      messa_a_punto -
      costr_ind -
      rit_laboratorio -
      no_energia -
      tempi_pulizia -
      guasto -
      tempo_protezioni -
      tempo_cricche -
      altre_attivita;
    this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, val);
  }

  // Ore produttive
  calcKpi27(id: any, gruppoLavoro: string): void {
    const ore_funz_eff = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}24`) || 0;
    const ore_rilavorazioni = this.valoriKpiSommaReparti.get(`${gruppoLavoro}25`) || 0;

    const val = ore_funz_eff - ore_rilavorazioni;
    this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, val);
  }

  // Capacità Pratica
  calcKpi28(id: any, gruppoLavoro: string): void {
    const capacita_teorica = this.valoriKpiSommaReparti.get(`${gruppoLavoro}31`) || 0;
    const ore_acceso = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}14`) || 0;

    if (capacita_teorica > 0) {
      const val = (ore_acceso / capacita_teorica).toFixed(3);
      this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, parseFloat(val));
    } else {
      this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, 0);
    }
  }

  // Saturazione commerciale
  calcKpi4(id: any, gruppoLavoro: string): void {
    const capacita_teorica = this.valoriKpiSommaReparti.get(`${gruppoLavoro}31`) || 0;
    const spento_no_materiale = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}21`) || 0;
    const spento_manutenzione = this.valoriKpiSommaReparti.get(`${gruppoLavoro}5`) || 0;
    const spento_manutenzione_strao = this.valoriKpiSommaReparti.get(`${gruppoLavoro}6`) || 0;
    const festivita = this.valoriKpiSommaReparti.get(`${gruppoLavoro}20`) || 0;
    if (capacita_teorica > 0) {
      const val = (
        (capacita_teorica -
          spento_no_materiale -
          spento_manutenzione -
          spento_manutenzione_strao -
          festivita) /
        capacita_teorica
      ).toFixed(3);
      this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, parseFloat(val));
    } else {
      this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, 0);
    }
  }

  // OEE
  calcKpi15(id: any, gruppoLavoro: string): void {
    const tasso_qualita = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}29`) || 0;
    const eff_prod = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}1`) || 0;
    const aviability = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}3`) || 0;

    const val = (tasso_qualita * eff_prod * aviability).toFixed(3);
    this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, parseFloat(val));
  }

  // Tasso Qualita
  calcKpi29(id: any, gruppoLavoro: string): void {
    const ore_produttive = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}27`) || 0;
    const ore_funz_eff = this.valoriKpiCalcolati.get(`somma${gruppoLavoro}24`) || 0;

    if (ore_funz_eff > 0) {
      const val = (ore_produttive / ore_funz_eff).toFixed(3);
      this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, parseFloat(val));
    } else {
      this.valoriKpiCalcolati.set(`somma${gruppoLavoro}${id}`, 0);
    }
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
        val += valore.valore ? parseInt(valore.valore) : 0;
        // la aggiorno
        this.valoriKpiSommaReparti.set(key, val);
      }
    });

    // aggiorno anche i kpi calcolati
    this.kpi_rows.forEach((kpi: any) => {
      if (kpi.calcolato) {
        this.calcKpi(kpi, gruppoLavoro);
      }
    });
  }
  dipendentiChange(value: any) {
    this.dipendenti.value = value
    this.dipendenti.dipendentiChangeFlag = true

    // aggiorno anche i kpi calcolati
    this.kpi_rows.forEach((kpi: any) => {
      if (kpi.calcolato) {
        this.calcKpi(kpi, 'IND');
      }
    });
  }
  inputOreAccesoChanged(kpi: any, gruppoLavoro: string, row: any) {
    // il dato è stato cambiato quindi è una forzatura
    row.forzatura_manuale = true;
    if (row.val == '0') {
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
        const key = `somma${impianto.gruppo_impianto}${kpi.id}`;
        // azzero la somma calcolata inizialmente
        this.valoriKpiCalcolati.set(key, val);
        // la incremento con i nuovi valori
        val += valore.val ? parseInt(valore.val) : 0;
        // la aggiorno
        this.valoriKpiCalcolati.set(key, val);
        this.kpiCalcolatiForzatiManualmente.set(key, true);
      }
    });

    // aggiorno anche i kpi calcolati
    this.kpi_rows.forEach((kpi: any) => {
      if (kpi.calcolato) {
        this.calcKpi(kpi, gruppoLavoro);
      }
    });
  }

  onSubmit() {
    this.gestioneImpiantiService
      .postDataIND(
        this.kpi_rows,
        this.valoriKpiCalcolati,
        this.kpiCalcolatiForzatiManualmente,
        this.tableFilters.year,
        this.tableFilters.month,
        this.dipendenti,
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
