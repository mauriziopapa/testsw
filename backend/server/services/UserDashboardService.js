const UserDashboard = require('../models/sapere/UserDashboard');

module.exports.findAll = async () => UserDashboard.findAll();

module.exports.findOneById = async (id) => UserDashboard.findByPk(id);

module.exports.updateColumns = async (id, columns) =>
  UserDashboard.update({ columns }, { where: { iduser_dashboard: id } });
