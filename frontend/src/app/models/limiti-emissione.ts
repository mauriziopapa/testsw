import { Inquinante } from './inquinante';

export class LimitiEmissione {
  id = 0;
  id_punto_di_emissione = 0;
  punto_di_emissione = '';
  inquinanti = new Array<Inquinante>();

  constructor(id: number, id_punto_di_emissione: number, punto_di_emissione: string) {
    this.id = id;
    this.id_punto_di_emissione = id_punto_di_emissione;
    this.punto_di_emissione = punto_di_emissione;
  }
}
