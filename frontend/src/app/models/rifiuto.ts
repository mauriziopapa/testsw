export class Rifiuto {
  id = 0;
  nome = '';
  udm = '';

  constructor(id: number, nome: string, udm = '') {
    this.id = id;
    this.nome = nome;
    this.udm = udm;
  }
}
