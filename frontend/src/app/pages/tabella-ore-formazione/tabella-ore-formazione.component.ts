import { Component } from '@angular/core';
import { OreFormazione } from 'src/app/models/ore-formazione';
import { MatTableDataSource } from '@angular/material/table';
import { OreFormazioneService } from 'src/app/services/ore-formazione.service';

@Component({
    selector: 'tabella-ore-formazione',
    templateUrl: './tabella-ore-formazione.component.html',
    styleUrls: ['./tabella-ore-formazione.component.scss'],
    standalone: false
})
export class TabellaOreFormazioneComponent {
  dataSource: MatTableDataSource<OreFormazione>;
  columns = [
    {
      columnDef: 'data',
      header: 'Data',
      cell: (element: OreFormazione) => (element.data ? `${element.data}` : '-')
    },
    {
      columnDef: 'n_protocollo',
      header: 'N° Protocollo',
      cell: (element: OreFormazione) => (element.n_protocollo ? `${element.n_protocollo}` : '-')
    },
    {
      columnDef: 'tipologia',
      header: 'Tipologia',
      cell: (element: OreFormazione) => (element.tipologia ? `${element.tipologia} ` : '-')
    },
    {
      columnDef: 'costo',
      header: 'Costo',
      cell: (element: OreFormazione) => (element.costo ? `${element.costo} h` : '-')
    },
    {
      columnDef: 'ore',
      header: 'Ore',
      cell: (element: OreFormazione) => (element.ore ? `${element.ore} h` : '-')
    }
  ];
  displayedColumns = this.columns.map((c) => c.columnDef);

  constructor(private OreFormazioneService: OreFormazioneService) {
    this.dataSource = new MatTableDataSource();
    this.OreFormazioneService.findAll().subscribe((OreFormazione) => {
      this.dataSource = new MatTableDataSource(OreFormazione);
    });
  }
}
