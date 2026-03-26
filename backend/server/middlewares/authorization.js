const { Securable, Role } = require('../models/index');

const config = require('../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.isAuthorized = function isAuthorized(securableName, action) {
  return async (request, response, next) => {
    const { user } = request;

    const securables = await Securable.findAll({
      where: { name: securableName },
      include: [
        {
          model: Role,
          where: {
            id: user.roles.map((role) => role.id)
          }
        }
      ]
    });

    const isAuthorizedToAction = securables
      .map((securable) => securable.roles.map((role) => role.securable_role.get(action)))
      .reduce((prev, current) => prev || current, false);

    if (isAuthorizedToAction[0]) {
      next();
    } else {
      log.error(`Access Forbidden to ${securableName} for user with id ${user.id}`);
      response.status(403).json({ error: 'Forbidden' });
    }
  };
};
