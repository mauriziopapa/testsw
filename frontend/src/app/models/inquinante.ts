export class Inquinante {
  id = 0;
  nome = '';
  udm = '';
  limite = 0;

  constructor(id: number, nome: string, udm = '', limite: number) {
    this.id = id;
    this.nome = nome;
    this.udm = udm;
    this.limite = limite;
  }
}
