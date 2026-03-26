const md5 = require('md5');
const express = require('express');
const passport = require('passport');
const UserService = require('../../services/UserService');
const { isAuthenticated } = require('../../middlewares/authentication');
const { isAuthorized } = require('../../middlewares/authorization');
const { CREATE, READ, UPDATE, DELETE } = require('../../lib/actions');

const MODULE = 'Users';

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();
const router = express.Router();

const DEFAULT_PAGE_SIZE = 20;

module.exports = () => {
  router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.sendStatus(401);
      }
      req.logIn(user, () => {
        if (err) {
          return next(err);
        }
        log.info(`User ${user.username} logged in.`);
        UserService.updateLogins(user.id);
        return res.json({
          id: user.id,
          username: user.username,
          name: user.name,
          surname: user.surname,
          theme: req.user.theme,
          dashboards: user.user_dashboards
            .map((ud) => ({ id: ud.iduser_dashboard, columns: ud.columns, dashboard: ud.dashboard }))
            .map((d) => ({
              id: d.id,
              iddashboard: d.dashboard.iddashboard,
              name: d.dashboard.name,
              url: d.dashboard.url,
              cols: d.columns
            }))
        });
      });
    })(req, res, next);
  });

  router.get('/logout', (req, res, next) => {
    log.info(`User ${req.user.username} logged out.`);
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).send();
    });
  });

  router.get('/account', isAuthenticated, (req, res) => {
    const user = {
      provinces: req.user.provinces,
      username: req.user.username,
      email: req.user.email,
      name: req.user.name,
      telephone: req.user.telephone,
      surname: req.user.surname,
      theme: req.user.theme,
      dashboards: req.user.user_dashboards
        .map((ud) => ({ id: ud.iduser_dashboard, columns: ud.columns, dashboard: ud.dashboard }))
        .map((d) => ({
          id: d.id,
          iddashboard: d.dashboard.iddashboard,
          name: d.dashboard.name,
          url: d.dashboard.url,
          cols: d.columns
        }))
    };
    return res.json(user);
  });

  router.get('/', [isAuthenticated, isAuthorized(MODULE, READ)], async (req, res) => {
    try {
      const { page, size, province, name } = req.query;
      const { limit, offset } = getPagination(page, size);

      const data = await UserService.findAndCountAll(province, name, limit, offset);

      const plainUsers = [];
      data.rows.forEach((user) => {
        const plainProvinces = user.provinces.map((p) => p.province);
        const plainUser = user.get({ plain: true });
        plainUser.provinces = plainProvinces;
        plainUsers.push(plainUser);
      });

      const response = getPagingData(plainUsers, page, limit);
      return res.json(response);
    } catch (error) {
      log.error(`Error finding users: ${error.message}`, error);
      return res.status(500).send({ error: 'Si è verificato un errore' });
    }
  });

  router.get('/:id', [isAuthenticated, isAuthorized(MODULE, READ)], async (req, res) => {
    try {
      const user = await UserService.findOneById(req.params.id);
      if (!user) {
        return res.status(404).send();
      }

      const plainUser = user.get({ plain: true });
      const plainProvinces = plainUser.provinces.map((p) => p.province);
      plainUser.provinces = plainProvinces;

      return res.json(plainUser);
    } catch (error) {
      log.error(`Error finding user: ${error.message}`, error);
      return res.status(500).send({ error: 'Si è verificato un errore' });
    }
  });

  router.put('/:id', [isAuthenticated, isAuthorized(MODULE, UPDATE)], async (req, res) => {
    try {
      const newUser = {
        username: req.body.username,
        email: req.body.email,
        name: req.body.name,
        telephone: req.body.telephone,
        surname: req.body.surname,
        product_discount: req.body.product_discount,
        quotation_discount: req.body.quotation_discount,
        provinces: req.body.provinces.map((provinceName) => ({
          province: provinceName
        }))
      };
      const newRole = req.body.roles[0];
      const oldUser = await UserService.findOneById(req.params.id);
      if (oldUser) {
        const updatedUser = await UserService.update(newUser, oldUser, newRole, req.params.id);
        return res.json(updatedUser);
      }
      return res.status(404).send();
    } catch (error) {
      log.error(`Error during user update: ${error.message}`, error);
      return res.status(500).send({ error: 'Si è verificato un errore' });
    }
  });

  router.put('/update_password/:id', [isAuthenticated, isAuthorized(MODULE, UPDATE)], async (req, res) => {
    try {
      if (req.body.newPassword === req.body.newPasswordRepeat) {
        const oldPasswordCrypt = req.body.oldPassword;
        const oldUser = await UserService.findOneByIdForModifyPassword(req.params.id);
        const candidate = md5(oldPasswordCrypt);
        if (oldUser.password === candidate) {
          const newPasswordCrypt = await md5(req.body.newPassword);
          const newUser = { password: newPasswordCrypt };
          await UserService.updatePassword(newUser, req.params.id);
          return res.status(204).send();
        }
        return res
          .status(400)
          .send({ message: "La vecchia password inserita non è corretta, prestare attenzione durante l'inserimento" });
      }
      return res.status(400).send({ message: 'La nuova password inserita e quella ripetuta non coincidono' });
    } catch (error) {
      log.error(`Error during password update: ${error.message}`, error);
      return res.status(500).send({ error: 'Si è verificato un errore' });
    }
  });

  return router;
};

const getPagination = (page, size) => {
  const limit = size ? +size : DEFAULT_PAGE_SIZE;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

const getPagingData = (users, page, limit) => {
  const totalItems = users.length;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  return {
    totalItems,
    users,
    totalPages,
    currentPage
  };
};
