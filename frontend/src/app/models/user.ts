import { Role } from './role';
import { Dashboard } from './dashboard';

export class User {
  id = '';
  username = '';
  password = '';
  email = '';
  name = '';
  surname = '';
  theme = '';
  roles = new Array<Role>();
  dashboards = new Array<Dashboard>();
}
