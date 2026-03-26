import { Contatore } from './contatore';

export class ContatoreMisurazione {
  id = null;
  id_contatore = 0;
  nome_contatore = '';
  data = new Date();
  misurazione = 0;
  contatoris!: Array<Contatore>;
  udm = 'kWh';
}
