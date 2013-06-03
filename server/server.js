var express = require('express'),
    config = require('../config/config.js'),
    api = require('../mongodb');
    http = require('http');

var Server = function Server() {
  var app = express();

  var configure = function configure() {
    app.use(express.bodyParser());

    app.set('port', config.get('port'));
    app.use('/', express.static(config.get('static_dir')));
    app.use(express.bodyParser());

    api.registerPaths(app, config);
  };

  var start = function start() {
    configure();

    http.createServer(app).listen(app.get('port'), function() {
      console.log('Express server listening on port ' + app.get('port'));
    });
  };

  return {
    'start': start
  };
}();

module.exports = Server;
