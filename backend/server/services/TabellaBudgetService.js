const BudgetTable = require('../models/response/BudgetTable');

const BudgetProgetti = require('../models/bi/BudgetProgetti');
const Budget = require('../models/bi/Budget');

const ClientiService = require('./ClientiService');

module.exports.saveData = async (budgets) => {
  const [nuoviProgettiBudget, totalBudget] = budgets;
  // Aggiorno il budget progetti
  const promises = [nuoviProgettiBudget]
    .map((bg) => ({ id: bg.id, anno: bg.anno, budget: bg.budget }))
    .map((budget) => BudgetProgetti.upsert(budget));
  const results = await Promise.all(promises);

  const mediaBudget = totalBudget.budget / 11;
  const metaMese = mediaBudget / 2;

  // Aggiorno la tabella budget
  const budgetProm = [];
  let cumulativo = 0;
  let budget;
  // calcolo il budget da suddividere per tutto l'anno
  for (let i = 1; i <= 12; i += 1) {
    // i mesi di agosto e dicembre vanno presi per metà
    if (i === 8 || i === 12) {
      cumulativo += metaMese;
      budget = { anno: totalBudget.anno, plan: metaMese, plan_cum: cumulativo, mese: i };
    } else {
      cumulativo += mediaBudget;
      budget = { anno: totalBudget.anno, plan: mediaBudget, plan_cum: cumulativo, mese: i };
    }
    budgetProm.push(
      Budget.update(
        { plan: budget.plan, plan_cum: budget.plan_cum },
        { where: { anno: budget.anno, mese_num: budget.mese } }
      )
    );
  }
  const output = await Promise.all(budgetProm);

  return results;
};

module.exports.getData = async (anno) => {
  const where = {
    where: { anno }
  };

  const budgetClienti = await ClientiService.getBudgetClienti(anno);
  const budgetClientiV = new BudgetTable.Builder()
    .setAnno(anno)
    .setDescrizione('Budget Clienti')
    .setBudget(budgetClienti)
    .setReadonly(true)
    .build();

  const budgetProgetti = await BudgetProgetti.findAll(where);
  const nuoviProgettiBudget = budgetProgetti[0].get('budget');
  const nuoviProgetti = new BudgetTable.Builder()
    .setId(budgetProgetti[0].get('id'))
    .setAnno(anno)
    .setDescrizione('Nuovi Progetti')
    .setBudget(Math.round(nuoviProgettiBudget))
    .build();

  const totale = budgetClienti + nuoviProgettiBudget;
  const totaleV = new BudgetTable.Builder()
    .setAnno(anno)
    .setDescrizione('Totale')
    .setBudget(Math.round(totale))
    .setReadonly(true)
    .build();

  return [budgetClientiV, nuoviProgetti, totaleV];
};
