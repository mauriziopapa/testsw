import { Rifiuto } from './rifiuto';

export class RifiutoProdotto {
  id = null;
  id_rifiuto = 0;
  nome_rifiuto = '';
  data = new Date();
  quantita = 0;
  rifiutis!: Array<Rifiuto>;
  udm = 'kg';
}
