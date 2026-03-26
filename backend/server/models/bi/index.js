const Contatore = require('./Contatore');
const ContatoreMisurazione = require('./ContatoreMisurazione');
const ContatoreMisurazioneMetano = require('./ContatoreMisurazioneMetano');
const ContatoreMetano = require('./ContatoreMetano');
const Rifiuto = require('./Rifiuto');
const RifiutoProdotto = require('./RifiutoProdotto');
const FornitoreTS = require('./FornitoreTS');
const OrdineTS = require('./OrdineTS');
const MateriaPrimaTS = require('./MateriaPrimaTS');
const MateriaPrima = require('./MateriaPrima');
const Emissioni = require('./Emissioni');
const LimitiInquinanti = require('./LimitiInquinanti');
const PuntoDiEmissione = require('./PuntoDiEmissione');
const Inquinante = require('./Inquinante');
const MappingMateriePrimeMpTS = require('./MappingMateriePrimeMpTS');

const contatoreMisurazioneAssociation = ContatoreMisurazione.hasMany(Contatore, {
  foreignKey: 'id',
  sourceKey: 'id_contatore'
});

const contatoreMisurazioneMetanoAssociation = ContatoreMisurazioneMetano.hasMany(ContatoreMetano, {
  foreignKey: 'id',
  sourceKey: 'id_contatore'
});

const emissioneAssociation = Emissioni.hasMany(PuntoDiEmissione, {
  foreignKey: 'id',
  sourceKey: 'id_punto_di_emissione'
});

const inquinantiAssociation = Emissioni.hasMany(Inquinante, {
  foreignKey: 'id',
  sourceKey: 'id_inquinante'
});

const limitiEmissioneAssociation = LimitiInquinanti.hasMany(PuntoDiEmissione, {
  foreignKey: 'id',
  sourceKey: 'punto_di_emissione'
});

const limitiInquinantiAssociation = LimitiInquinanti.hasMany(Inquinante, {
  foreignKey: 'id',
  sourceKey: 'inquinante'
});

const materiaPrimaAssociation = MappingMateriePrimeMpTS.hasMany(MateriaPrima, {
  foreignKey: 'id',
  sourceKey: 'id_materiaprima'
});

const materiaPrimaTsAssociation = MappingMateriePrimeMpTS.hasMany(MateriaPrimaTS, {
  foreignKey: 'id',
  sourceKey: 'id_materiaprima_ts'
});

const rifiutiProdottiAssociation = RifiutoProdotto.hasMany(Rifiuto, {
  foreignKey: 'id',
  sourceKey: 'id_rifiuto'
});

const ordineFornitoreAssociation = OrdineTS.hasMany(FornitoreTS, {
  foreignKey: 'CodiceFornitore',
  sourceKey: 'IdFornitore'
});

const materiaPrimaFornitoreAssociation = MateriaPrimaTS.hasMany(FornitoreTS, {
  foreignKey: 'CodiceFornitore',
  sourceKey: 'CodFornitore'
});

module.exports = {
  Contatore,
  ContatoreMisurazione,
  ContatoreMetano,
  ContatoreMisurazioneMetano,
  Rifiuto,
  RifiutoProdotto,
  contatoreMisurazioneMetanoAssociation,
  contatoreMisurazioneAssociation,
  emissioneAssociation,
  inquinantiAssociation,
  limitiEmissioneAssociation,
  limitiInquinantiAssociation,
  rifiutiProdottiAssociation,
  ordineFornitoreAssociation,
  materiaPrimaFornitoreAssociation,
  materiaPrimaAssociation,
  materiaPrimaTsAssociation
};
