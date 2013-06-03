var config = require('../config/config.js'),
    mongoq = require('mongoq'),
    request = require('request'),
    forEachAsync = require('futures/node_modules/forEachAsync/forEachAsync'),
    url = require('url');

var EnhanceHosted = function EnhanceHosted() {
  var db = mongoq(config.get('mongo:url'), {safe: false});

  var processManifest = function processManifest(manifestUrl, cb) {
    request(manifestUrl, function onBody(err, response, body) {
      function onError() {
        cb({'enhanced': {
          'manifestUrl': manifestUrl,
          'app_cache_defined': false
        }}); 
      }
      if (err) {
        console.error(err);
        onError();
        return;
      } else if (response.statusCode != 200) {
        console.error(response.statusCode);
        onError();
        return;
      }

      var manifest;
      try {
        manifest = JSON.parse(body);
      } catch(e) {
        console.log('Error cause of ' + e + ' while processing ' + manifestUrl);
        onError();
        return;
      }
      
      var launchPoint = getLaunchPoint(manifestUrl, manifest);

      var enhanced = {
        'manifestUrl': manifestUrl,
        'app_cache_defined': 'appcache_path' in manifest,
        'launchPoint': launchPoint
      };

      manifest.enhanced = enhanced;
      cb(manifest);

    });
  };

  var getLaunchPoint = function getLaunchPoint(manifestUrl, manifest) {
    var launchPath = manifest.launch_path || '';
      
    var parsed = url.parse(manifestUrl);

    return parsed.protocol + "//" + parsed.host + launchPath;
  };

  var enhanceOne = function enchanceOne(next, appEntry) {
    processManifest(appEntry.manifest_url, function onManifest(manifest) {
      var manifestUrl = manifest.enhanced.manifestUrl;
      var appsCollection = db.collection('apps');
      console.log('--> ' + manifestUrl);
      appsCollection.findOne({'manifest_url': manifestUrl}).done(function onApp(app) {
        app.extra = manifest;
        appsCollection.update({'_id': app._id}, app).done(function onUpdate() {
          next();
        }).fail(function onFail() {
          next();
        })
      });
    });
  };

  var enhanceAll = function enhanceAll() {
    var apps = db.collection('apps');
    apps.find({'is_packaged': false}).toArray().done(function onApps(data) {
      if (!data) {
        return;
      }

      var app, manifest, theApps;
      theApps = [];
      for(var i = 0; i < data.length; i++) {
        app = data[i];
        if (app.enhanced) {
          continue;
        }

        theApps.push(app);
      }

      //var sample = theApps.slice(200,300);
      var sample = theApps;
      forEachAsync(sample, enhanceOne, {}).then(function() {
        console.log('Process done');
        db.close();
        process.exit(0);
      });


    }).fail(function onError(err) {
      console.error(err);
    });

  };

  return {
    'enhanceAll': enhanceAll
  };
}();

EnhanceHosted.enhanceAll();
