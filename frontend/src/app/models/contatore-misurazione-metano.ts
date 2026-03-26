import { ContatoreMetano } from './contatore-metano';

export class ContatoreMisurazioneMetano {
  id = null;
  id_contatore = 0;
  nome_contatore = '';
  data = new Date();
  misurazione = 0;
  contatori_metanos!: Array<ContatoreMetano>;
  udm = 'kWh';
}
