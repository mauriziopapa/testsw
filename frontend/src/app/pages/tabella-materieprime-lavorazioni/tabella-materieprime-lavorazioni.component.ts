import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MateriaPrimaLavorazione } from 'src/app/models/materiaprima-lavorazione';
import { MateriePrimeService } from 'src/app/services/materie-prime.service';

@Component({
    selector: 'tabella-materieprime-lavorazioni',
    templateUrl: './tabella-materieprime-lavorazioni.component.html',
    styleUrls: ['./tabella-materieprime-lavorazioni.component.scss'],
    standalone: false
})
export class TabellaMPLavorazioniComponent {
  dataSource: MatTableDataSource<MateriaPrimaLavorazione>;
  columns = [
    {
      columnDef: 'id',
      header: '#',
      cell: (element: MateriaPrimaLavorazione) => `${element.id}`
    },
    {
      columnDef: 'cod_trattamento',
      header: 'Trattamento',
      cell: (element: MateriaPrimaLavorazione) => `${element.cod_trattamento}`
    },
    {
      columnDef: 'gruppo_lavorazione',
      header: 'Gruppo Lavorazione',
      cell: (element: MateriaPrimaLavorazione) => `${element.gruppo_lavorazione}`
    },
    {
      columnDef: 'gruppo_lavorazione_descrizione',
      header: 'Descrizione',
      cell: (element: MateriaPrimaLavorazione) => `${element.gruppo_lavorazione_descrizione}`
    },
    {
      columnDef: 'reparto',
      header: 'Reparto',
      cell: (element: MateriaPrimaLavorazione) => `${element.reparto}`
    },
    {
      columnDef: 'nome_materiaprima',
      header: 'Materia Prima',
      cell: (element: MateriaPrimaLavorazione) => `${element.nome_materiaprima}`
    }
  ];
  displayedColumns = this.columns.map((c) => c.columnDef);

  constructor(private materiePrimeService: MateriePrimeService) {
    this.dataSource = new MatTableDataSource();
    this.materiePrimeService.findAllMateriePrimeLavorazioni().subscribe((lavorazioni) => {
      this.dataSource = new MatTableDataSource(lavorazioni);
    });
  }
}
