const { User, Role } = require('../models');
const UserRoles = require('../models/sapere/UserRoles');
const { db } = require('../lib/db');

const { Op } = db.Sequelize;

const config = require('../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.findAll = async () => {
  const users = await User.scope('withoutPassword').findAll({
    include: [
      {
        model: Role,
        through: {
          attributes: []
        }
      }
    ]
  });
  return users;
};

module.exports.findAndCountAll = async (name, limit, offset) => {
  const userNameCondition = name ? { name: { [Op.like]: `%${name}%` } } : null;
  const users = await User.scope('withoutPassword').findAndCountAll({
    include: [
      {
        model: Role,
        through: {
          attributes: []
        }
      }
    ],
    where: userNameCondition,
    limit,
    offset
  });
  return users;
};

module.exports.findByUsername = async (username) => {
  const usernameCondition = username ? { username: { [Op.eq]: username } } : null;

  const user = await User.scope('withoutPassword').findOne({
    where: usernameCondition
  });
  return user;
};

module.exports.findOneById = async (id) => {
  const user = await User.scope('withoutPassword').findByPk(id, {
    include: [
      {
        model: Role,
        through: {
          attributes: []
        }
      }
    ]
  });
  return user;
};

module.exports.findOneByIdForModifyPassword = async (id) => {
  const user = await User.findByPk(id, {});
  return user;
};

module.exports.update = async (newUser, oldUser, newRole, id) => {
  const updatedUser = await User.scope('withoutPassword').update(newUser, {
    where: { id }
  });

  const olduserRoles = await UserRoles.findAll({ where: { user_id: id }, paranoid: false });
  const oldRoleFound = olduserRoles.filter((oldRole) => oldRole.role_id === newRole.id);
  if (oldRoleFound.length === 0) {
    await oldUser.setRoles([newRole.id]);
  } else if (oldRoleFound[0].isSoftDeleted()) {
    await oldRoleFound[0].restore();
    const oldActiveRole = olduserRoles.filter((oldRole) => oldRole.role_id === oldUser.roles[0].id);
    await oldActiveRole[0].destroy();
  }

  return updatedUser;
};

module.exports.updatePassword = async (newUser, id) => {
  const updatedUser = await User.update(newUser, {
    where: { id }
  });

  return updatedUser;
};

module.exports.updateLogins = async (id) => User.increment('logins', { by: 1, where: { id } });

module.exports.deleteUser = async (id) => {
  await User.destroy({ where: { id } });
};
