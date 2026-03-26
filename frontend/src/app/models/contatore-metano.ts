export class ContatoreMetano {
  id = 0;
  codice = '';
  nome = '';
  udm = '';

  constructor(id: number, codice: string, nome: string, udm = '') {
    this.id = id;
    this.codice = codice;
    this.nome = nome;
    this.udm = udm;
  }
}
