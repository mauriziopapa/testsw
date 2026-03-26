const User = require('./sapere/User');
const Role = require('./sapere/Role');
const UserRoles = require('./sapere/UserRoles');
const Securable = require('./sapere/Securable');
const SecurableRole = require('./sapere/SecurableRole');

const Widget = require('./sapere/Widget');
const Dashboard = require('./sapere/Dashboard');
const UserDashboard = require('./sapere/UserDashboard');

Role.belongsToMany(User, { through: UserRoles, foreignKey: 'role_id' });
User.belongsToMany(Role, { through: UserRoles, foreignKey: 'user_id' });

// The Super Many-to-Many relationship
Role.belongsToMany(Securable, { through: SecurableRole, foreignKey: 'role_id' });
Securable.belongsToMany(Role, { through: SecurableRole, foreignKey: 'securable_id' });
Role.hasMany(SecurableRole, { foreignKey: 'role_id' });
SecurableRole.belongsTo(Role, { foreignKey: 'role_id' });
Securable.hasMany(SecurableRole, { foreignKey: 'securable_id' });
SecurableRole.belongsTo(Securable, { foreignKey: 'securable_id' });

User.hasMany(UserDashboard, { foreignKey: 'iduser' });
UserDashboard.belongsTo(User, { foreignKey: 'iduser' });

Dashboard.hasMany(UserDashboard, { foreignKey: 'iddashboard' });
UserDashboard.belongsTo(Dashboard, { foreignKey: 'iddashboard' });

module.exports = {
  User,
  Role,
  UserRoles,
  Securable,
  SecurableRole,
  Dashboard,
  UserDashboard,
  Widget
};
