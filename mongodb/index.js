var mongoq = require('mongoq');

var MongoDB = function MongoDB() {

  var conf, db;

  var getStats = function getStats(req, res) {
    var apps = db.collection('apps');
    apps.count()
    .and(apps.find({'is_packaged': false}).count())
    .and(apps.find({'is_packaged': true}).count())
    .and(apps.find({'extra.enhanced.app_cache_defined': true}).count())
    .and(apps.find({'extra.enhanced.app_cache_defined': false}).count())
    .done(function(total, hosted, packaged,
      with_appcache_defined, without_appcache_defined) {
        res.json({
          'total': total,
          'hosted': hosted,
          'packaged': packaged,
          'unknown': (total - hosted - packaged),
          'appcache_defined': with_appcache_defined,
          'without_appcache_defined': without_appcache_defined
        });
    })
    .fail(function(err) {
      res.send(404, err);
    });
  };

  var getAppsByFilter = function getAppsByFilter(filter, req, res) {
    db.collection('apps').find(filter)
    .toArray()
    .done(function (apps) {
      res.json(apps);
    }).fail(function(err) {
      res.send(404, err);
    });
  };

  var getAllApps = function getAllApps(res, req) {
    getAppsByFilter({}, res, req);
  };

  var getPackagedApps = function getPackagedApps(res, req) {
    getAppsByFilter({'is_packaged': true}, res, req);
  };

  var getHostedApps = function getHostedApps(res, req) {
    getAppsByFilter({'is_packaged': false}, res, req);
  }

  var registerPaths = function registerPaths(app, c) {
    conf = c;

    db = mongoq(conf.get('mongo:url'), {safe: false});

    app.get('/api/apps', getAllApps);
    app.get('/api/apps/packaged', getPackagedApps);
    app.get('/api/apps/hosted', getHostedApps);
    app.get('/api/stats', getStats)
  };

  return {
    registerPaths: registerPaths
  }

}();

module.exports = MongoDB;
