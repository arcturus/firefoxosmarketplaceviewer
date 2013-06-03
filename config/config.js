var fs = require('fs'),
    nconf = require('nconf');

var Config = function Config() {
  // Load config from file, override by arguments or env
  nconf.argv().env().file({
    file: __dirname + '/config.json'
  });

  if (process.env.VCAP_SERVICES) {
    try {
      var mongoCredentials = JSON.parse(process.env.VCAP_SERVICES);
      var url = mongoCredentials['mongodb-1.8'][0].credentials.url;
      if (url) {
        nconf.set('mongo:url', url);
      }
    } catch (e) {
      console.log('Error getting mongo url ' + e);
    }
  }

  return nconf;
}();

module.exports = Config;
