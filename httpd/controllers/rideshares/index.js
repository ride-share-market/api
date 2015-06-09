'use strict';

module.exports = {
  create: require('./controller-rideshares-create'),
  findAll: require('./controller-rideshares-find-all'),
  findById: require('./controller-rideshares-find-by-id'),
  update: require('./controller-rideshares-update'),
  removeById: require('./controller-rideshares-remove-by-id')
};
