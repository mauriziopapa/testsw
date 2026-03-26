import { Component } from '@angular/core';
import { RifiutoLavorazione } from 'src/app/models/rifiuto-lavorazione';
import { RifiutiService } from 'src/app/services/rifiuti.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
    selector: 'tabella-rifiuti-lavorazioni',
    templateUrl: './tabella-rifiuti-lavorazioni.component.html',
    styleUrls: ['./tabella-rifiuti-lavorazioni.component.scss'],
    standalone: false
})
export class TabellaRifiutiLavorazioniComponent {
  dataSource: MatTableDataSource<RifiutoLavorazione>;
  columns = [
    {
      columnDef: 'id',
      header: '#',
      cell: (element: RifiutoLavorazione) => `${element.id}`
    },
    {
      columnDef: 'cod_trattamento',
      header: 'Trattamento',
      cell: (element: RifiutoLavorazione) => `${element.cod_trattamento}`
    },
    {
      columnDef: 'gruppo_lavorazione',
      header: 'Gruppo Lavorazione',
      cell: (element: RifiutoLavorazione) => `${element.gruppo_lavorazione}`
    },
    {
      columnDef: 'gruppo_lavorazione_descrizione',
      header: 'Descrizione',
      cell: (element: RifiutoLavorazione) => `${element.gruppo_lavorazione_descrizione}`
    },
    {
      columnDef: 'reparto',
      header: 'Reparto',
      cell: (element: RifiutoLavorazione) => `${element.reparto}`
    },
    {
      columnDef: 'nome_rifiuto',
      header: 'Rifiuto',
      cell: (element: RifiutoLavorazione) => `${element.nome_rifiuto}`
    }
  ];
  displayedColumns = this.columns.map((c) => c.columnDef);

  constructor(private rifiutiService: RifiutiService) {
    this.dataSource = new MatTableDataSource();
    this.rifiutiService.findAllRifiutiLavorazioni().subscribe((lavorazioni) => {
      this.dataSource = new MatTableDataSource(lavorazioni);
    });
  }
}
