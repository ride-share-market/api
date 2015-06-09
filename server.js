var koa = require('koa'),
  app = koa();

var config = require('./config/app'),
  logger = require(config.get('root') + '/config/log');

// Configure the KoaJS app middleswares
require('./config/koa')(app);

app.listen(config.get('app').port, function listen() {
  logger.info('Start API server listening on port ' + config.get('app').port);
});
