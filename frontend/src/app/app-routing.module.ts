import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErrorComponent } from './core/error/error.component';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { AppGuard } from './helpers/app.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then((m) => m.LoginModule)
  },
  {
    path: 'recupera_password',
    loadChildren: () =>
      import('./pages/reset-password/reset-password.module').then((m) => m.ResetPasswordModule)
  },
  {
    path: '',
    canActivate: [AppGuard],
    canActivateChild: [AppGuard],
    component: MainLayoutComponent,
    children: [
      {
        path: 'commerciale',
        loadChildren: () =>
          import('./pages/commerciale/commerciale.module').then((m) => m.CommercialeModule)
      },
      {
        path: 'direzione',
        loadChildren: () =>
          import('./pages/direzione/direzione.module').then((m) => m.DirezioneModule)
      },
      {
        path: 'acquisti',
        loadChildren: () => import('./pages/acquisti/acquisti.module').then((m) => m.AcquistiModule)
      },
      {
        path: 'amministrazione',
        loadChildren: () =>
          import('./pages/amministrazione/amministrazione.module').then(
            (m) => m.AmministrazioneModule
          )
      },
      {
        path: 'industrializzazione',
        loadChildren: () =>
          import('./pages/industrializzazione/industrializzazione.module').then(
            (m) => m.IndustrializzazioneeModule
          )
      },
      {
        path: 'assicurazione-qualita',
        loadChildren: () =>
          import('./pages/assicurazione-qualita/ass-qualita.module').then(
            (m) => m.AssicurazioneQualitaModule
          )
      },
      {
        path: 'sistema-gestione-qualita',
        loadChildren: () =>
          import('./pages/sistema-gestione-qualita/sistema-gestione-qualita.module').then(
            (m) => m.SistemaGestioneQualitaModule
          )
      },
      {
        path: 'logistica',
        loadChildren: () =>
          import('./pages/logistica/logistica.module').then((m) => m.LogisticaModule)
      },
      {
        path: 'laboratorio',
        loadChildren: () =>
          import('./pages/laboratorio/laboratorio.module').then((m) => m.LaboratorioModule)
      },
      {
        path: 'induzione',
        loadChildren: () =>
          import('./pages/induzione/induzione.module').then((m) => m.InduzioneModule)
      },
      {
        path: 'produzione',
        loadChildren: () =>
          import('./pages/produzione/produzione.module').then((m) => m.ProduzioneModule)
      },
      {
        path: 'manutenzione',
        loadChildren: () =>
          import('./pages/manutenzione/manutenzione.module').then((m) => m.ManutenzioneModule)
      },
      {
        path: 'pianificazione',
        loadChildren: () =>
          import('./pages/pianificazione/pianificazione.module').then((m) => m.PianificazioneModule)
      },
      {
        path: 'sicurezza-e-ambiente',
        loadChildren: () =>
          import('./pages/sicurezza-e-ambiente/sicurezza-e-ambiente.module').then(
            (m) => m.SicurezzaEAmbienteModule
          )
      },
      {
        path: 'assessment/:name',
        loadChildren: () =>
          import('./pages/assessment/assessment.module').then((m) => m.AssessmentModule)
      },
      {
        path: 'report-resa-carica-media',
        loadChildren: () =>
          import('./pages/report-resa-carica-media/report-resa-carica-media.module').then(
            (m) => m.ReportResaCaricaMediaModule
          )
      },
      {
        path: 'tabella-dati-impianti',
        loadChildren: () =>
          import('./pages/tabella-dati-impianti/tabella-dati-impianti.module').then(
            (m) => m.TabellaDatiImpiantiModule
          )
      },
      {
        path: 'tabella-dati-impianti-ind',
        loadChildren: () =>
          import('./pages/tabella-dati-impianti-ind/tabella-dati-impianti-ind.module').then(
            (m) => m.TabellaDatiImpiantiIndModule
          )
      },
      {
        path: 'tabella-dati-impianti-fvf',
        loadChildren: () =>
          import('./pages/tabella-dati-impianti-fvf/tabella-dati-impianti-fvf.module').then(
            (m) => m.TabellaDatiImpiantiFVFModule
          )
      },
      {
        path: 'tabella-dati-manutenzione',
        loadChildren: () =>
          import('./pages/tabella-dati-manutenzione/tabella-dati-manutenzione.module').then(
            (m) => m.TabellaDatiManutenzioneModule
          )
      },
      {
        path: 'tabella-dati-ritardo-manutenzione',
        loadChildren: () =>
          import(
            './pages/tabella-dati-ritardo-manutenzione/tabella-dati-ritardo-manutenzione.module'
          ).then((m) => m.TabellaDatiRitardoManutenzioneModule)
      },
      {
        path: 'tabella-dati-personale',
        loadChildren: () =>
          import('./pages/tabella-dati-personale/tabella-dati-personale.module').then(
            (m) => m.TabellaDatiPersonaleModule
          )
      },
      {
        path: 'tabella-dati-cartellino',
        loadChildren: () =>
          import('./pages/tabella-dati-cartellino/tabella-dati-cartellino.module').then(
            (m) => m.TabellaDatiCartellinoModule
          )
      },
      {
        path: 'tabella-dati-direzione',
        loadChildren: () =>
          import('./pages/tabella-dati-direzione/tabella-dati-direzione.module').then(
            (m) => m.TabellaDatiDirezioneModule
          )
      },
      {
        path: 'tabella-dati-concorrenti',
        loadChildren: () =>
          import('./pages/tabella-dati-concorrenti/tabella-dati-concorrenti.module').then(
            (m) => m.TabellaDatiConcorrentiModule
          )
      },
      {
        path: 'tabella-dati-rifiuti',
        loadChildren: () =>
          import('./pages/tabella-dati-rifiuti/tabella-dati-rifiuti.module').then(
            (m) => m.TabellaDatiRifiutiModule
          )
      },
      {
        path: 'tabella-dati-contatori-misurazioni',
        loadChildren: () =>
          import(
            './pages/tabella-dati-contatori-misurazioni/tabella-dati-contatori-misurazioni.module'
          ).then((m) => m.TabellaDatiContatoriMisurazioniModule)
      },
      {
        path: 'tabella-dati-misurazione-metano',
        loadChildren: () =>
          import(
            './pages/tabella-dati-misurazione-metano/tabella-dati-misurazione-metano.module'
          ).then((m) => m.TabellaDatiMisurazioneMetanoModule)
      },
      {
        path: 'tabella-dati-emissioni',
        loadChildren: () =>
          import('./pages/tabella-dati-emissioni/tabella-dati-emissioni.module').then(
            (m) => m.TabellaDatiEmissioniModule
          )
      },
      {
        path: 'tabella-dati-map-mp-ts',
        loadChildren: () =>
          import('./pages/tabella-dati-map-mp-ts/tabella-dati-map-mp-ts.module').then(
            (m) => m.TabellaDatiMapMpTSModule
          )
      },
      {
        path: 'tabella-dati-costo-materieprime',
        loadChildren: () =>
          import(
            './pages/tabella-dati-costo-materieprime/tabella-dati-costo-materieprime.module'
          ).then((m) => m.TabellaDatiCostoMateriePrimeModule)
      },
      {
        path: 'tabella-dati-budget',
        loadChildren: () =>
          import('./pages/tabella-dati-budget/tabella-dati-budget.module').then(
            (m) => m.TabellaDatiBudgetModule
          )
      },
      {
        path: 'tabella-dati-laboratorio',
        loadChildren: () =>
          import('./pages/tabella-dati-laboratorio/tabella-dati-laboratorio.module').then(
            (m) => m.TabellaDatiLaboratorioModule
          )
      },
      {
        path: 'tabella-contatori-lavorazioni',
        loadChildren: () =>
          import('./pages/tabella-contatori-lavorazioni/tabella-contatori-lavorazioni.module').then(
            (m) => m.TabellaContatoriLavorazioniModule
          )
      },
      {
        path: 'tabella-rifiuti-lavorazioni',
        loadChildren: () =>
          import('./pages/tabella-rifiuti-lavorazioni/tabella-rifiuti-lavorazioni.module').then(
            (m) => m.TabellaRifiutiLavorazioniModule
          )
      },
      {
        path: 'tabella-materieprime-lavorazioni',
        loadChildren: () =>
          import(
            './pages/tabella-materieprime-lavorazioni/tabella-materieprime-lavorazioni.module'
          ).then((m) => m.TabellaMPLavorazioniModule)
      },
      {
        path: 'tabella-fatturato-clienti',
        loadChildren: () =>
          import('./pages/tabella-fatturato-clienti/tabella-fatturato-clienti.module').then(
            (m) => m.TabellaFatturatoClientiModule
          )
      },
      {
        path: 'tabella-aumento-mp-fornitori',
        loadChildren: () =>
          import('./pages/tabella-aumento-mp-fornitori/tabella-aumento-mp-fornitori.module').then(
            (m) => m.TabellaAumentoMpFornitoriModule
          )
      },
      {
        path: 'tabella-costo-fornitori',
        loadChildren: () =>
          import('./pages/tabella-costo-fornitori/tabella-costo-fornitori.module').then(
            (m) => m.TabellaCostoFornitoriModule
          )
      },
      {
        path: 'tabella-riepilogo-clienti',
        loadChildren: () =>
          import('./pages/tabella-riepilogo-clienti/tabella-riepilogo-clienti.module').then(
            (m) => m.TabellaRiepilogoClientiModule
          )
      },
      {
        path: 'tabella-ordini-teamsystem',
        loadChildren: () =>
          import('./pages/tabella-ordini-teamsystem/tabella-ordini-teamsystem.module').then(
            (m) => m.TabellaOrdiniTeamSystemModule
          )
      },
      {
        path: 'tabella-ordini-materie-prime-teamsystem',
        loadChildren: () =>
          import(
            './pages/tabella-ordini-materie-prime-teamsystem/tabella-ordini-materie-prime-teamsystem.module'
          ).then((m) => m.TabellaOrdiniMateriePrimeTeamSystemModule)
      },
      {
        path: 'tabella-hr-dipendenti-teamsystem',
        loadChildren: () =>
          import(
            './pages/tabella-hr-dipendenti-teamsystem/tabella-hr-dipendenti-teamsystem.module'
          ).then((m) => m.TabellaHrDipendentiTeamSystem)
      },
      {
        path: 'tabella-ore-formazione',
        loadChildren: () =>
          import('./pages/tabella-ore-formazione/tabella-ore-formazione.module').then(
            (m) => m.TabellaOreFormazioneModule
          )
      },
      {
        path: 'tabella-zoho-tasks',
        loadChildren: () =>
          import('./pages/tabella-zoho-tasks/tabella-zoho-tasks.module').then(
            (m) => m.TabellaZohoTasksModule
          )
      },
      {
        path: 'tabella-timbrate-nc',
        loadChildren: () =>
          import('./pages/tabella-timbrate-nc/tabella-timbrate-nc.module').then(
            (m) => m.TabellaTimbrateNcModule
          )
      },
      {
        path: 'tabella-commesse-nc',
        loadChildren: () =>
          import('./pages/tabella-commesse-nc/tabella-commesse-nc.module').then(
            (m) => m.TabellaCommesseNcModule
          )
      }
    ]
  },
  { path: '**', component: ErrorComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
