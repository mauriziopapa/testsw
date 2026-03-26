const Target = require('../models/bi/Target');

module.exports.findAll = async () => Target.findAll();

module.exports.findOne = async (widget, anno) => Target.findOne({ where: { widget, anno } });

module.exports.upsert = async (target) => Target.upsert(target);
