import { Component } from '@angular/core';
import { ContatoreLavorazione } from 'src/app/models/contatore-lavorazione';
import { ContatoriService } from 'src/app/services/contatori.service';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';

@Component({
  selector: 'tabella-contatori-lavorazioni',
  templateUrl: './tabella-contatori-lavorazioni.component.html',
  styleUrls: ['./tabella-contatori-lavorazioni.component.scss']
})
export class TabellaContatoriLavorazioniComponent {
  dataSource: MatTableDataSource<ContatoreLavorazione>;
  columns = [
    {
      columnDef: 'id',
      header: '#',
      cell: (element: ContatoreLavorazione) => `${element.id}`
    },
    {
      columnDef: 'cod_trattamento',
      header: 'Trattamento',
      cell: (element: ContatoreLavorazione) => `${element.cod_trattamento}`
    },
    {
      columnDef: 'gruppo_lavorazione',
      header: 'Gruppo Lavorazione',
      cell: (element: ContatoreLavorazione) => `${element.gruppo_lavorazione}`
    },
    {
      columnDef: 'gruppo_lavorazione_descrizione',
      header: 'Descrizione',
      cell: (element: ContatoreLavorazione) => `${element.gruppo_lavorazione_descrizione}`
    },
    {
      columnDef: 'reparto',
      header: 'Reparto',
      cell: (element: ContatoreLavorazione) => `${element.reparto}`
    },
    {
      columnDef: 'nome_contatore',
      header: 'Contatore',
      cell: (element: ContatoreLavorazione) => `${element.nome_contatore}`
    }
  ];
  displayedColumns = this.columns.map((c) => c.columnDef);

  constructor(private contatoriService: ContatoriService) {
    this.dataSource = new MatTableDataSource();
    this.contatoriService.findAllContatoriLavorazioni().subscribe((lavorazioni) => {
      this.dataSource = new MatTableDataSource(lavorazioni);
    });
  }
}
