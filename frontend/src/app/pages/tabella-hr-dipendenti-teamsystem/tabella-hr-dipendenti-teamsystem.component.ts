import { Component } from '@angular/core';
import { HrDipendentiTeamsystem } from 'src/app/models/teamsystem-hr-dipendenti';
import { MatTableDataSource } from '@angular/material/table';
import { HrDipendentiTeamsystemService } from 'src/app/services/hr-dipendenti-teamsystem.service';

@Component({
    selector: 'tabella-hr-dipendenti-teamsystem',
    templateUrl: './tabella-hr-dipendenti-teamsystem.component.html',
    styleUrls: ['./tabella-hr-dipendenti-teamsystem.component.scss'],
    standalone: false
})
export class TabellaHrDipendentiTeamSystemComponent {
  dataSource: MatTableDataSource<HrDipendentiTeamsystem>;
  columns = [
    {
      columnDef: 'Matricola',
      header: 'matricola',
      cell: (element: HrDipendentiTeamsystem) => this.nullFormatter(element.matricola)
    },
    {
      columnDef: 'Azienda',
      header: 'Azienda',
      cell: (element: HrDipendentiTeamsystem) => this.nullFormatter(element.azienda)
    },
    {
      columnDef: 'Reparto',
      header: 'reparto',
      cell: (element: HrDipendentiTeamsystem) => this.nullFormatter(element.reparto)
    },
    {
      columnDef: 'Ruolo',
      header: 'ruolo',
      cell: (element: HrDipendentiTeamsystem) => this.nullFormatter(element.ruolo)
    },
    {
      columnDef: 'Licenziamento',
      header: 'licenziamento',
      cell: (element: HrDipendentiTeamsystem) => this.nullFormatter(element.licenziamento)
    }
  ];
  displayedColumns = this.columns.map((c) => c.columnDef);
  options: string[] = ['UNITRAT', 'TEMPRASUD'];
  selectedAzienda?: string;

  constructor(private ClientiService: HrDipendentiTeamsystemService) {
    this.dataSource = new MatTableDataSource();
    this.selectedAzienda = this.options[0];
    this.ClientiService.findAll(this.selectedAzienda).subscribe((clienti) => {
      this.dataSource = new MatTableDataSource(clienti);
    });
  }

  nullFormatter(value: any) {
    return value ? `${value}` : '-';
  }

  onSelect(value: string) {
    this.selectedAzienda = value;
    if (this.selectedAzienda) {
      this.ClientiService.findAll(this.selectedAzienda).subscribe((clienti) => {
        this.dataSource = new MatTableDataSource(clienti);
      });
    }
  }
}
