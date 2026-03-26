const express = require('express');
const LimitiInquinantiService = require('../../services/LimitiInquinantiService');
const { isAuthenticated } = require('../../middlewares/authentication');
const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const limiti = await LimitiInquinantiService.findAll();
      const output = limiti.map((limite) => ({
        id: limite.id,
        id_punto_di_emissione: limite.punto_di_emissione,
        punto_di_emissione: limite.punti_emissiones[0].nome,
        id_inquinante: limite.inquinante,
        inquinante: limite.inquinantis[0].nome,
        limite: limite.limite
      }));

      const pde = [];
      output.forEach((o) => {
        if (pde.some((p) => p.id_punto_di_emissione === o.id_punto_di_emissione)) {
          const punto = pde.find((p) => p.id_punto_di_emissione === o.id_punto_di_emissione);
          punto.inquinanti.push({
            id: o.id_inquinante,
            nome: o.inquinante,
            limite: o.limite
          });
        } else {
          pde.push({
            id_punto_di_emissione: o.id_punto_di_emissione,
            punto_di_emissione: o.punto_di_emissione,
            inquinanti: [
              {
                id: o.id_inquinante,
                nome: o.inquinante,
                limite: o.limite
              }
            ]
          });
        }
      });

      pde.forEach((p) => {
        p.inquinanti.sort((a, b) => a.nome.localeCompare(b.nome));
      });

      return res.json(pde);
    } catch (error) {
      log.error(`Error finding limiti inquinanti: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/:id', [isAuthenticated], async (req, res) => {
    try {
      const limiti = await LimitiInquinantiService.findOneById(req.params.id);
      return res.json(limiti);
    } catch (error) {
      log.error(`Error finding limiti inquinanti: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
