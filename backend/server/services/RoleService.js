const Role = require('../models/sapere/Role');

module.exports.findAll = async () => {
  const roles = await Role.findAll();
  return roles;
};

module.exports.findOneById = async (id) => {
  const role = await Role.findByPk(id);
  return role;
};
