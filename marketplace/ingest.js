var request = require('request');

var MarketPlaceIngestor = function MarketPlaceIngestor() {
  var BASE_URL = 'https://marketplace.firefox.com/api/v1/apps/search/?format=json&limit=100';
  var HOST = 'https://marketplace.firefox.com';

  var recursiveFetch = function recursiveFetch(url, apps, cb) {
    request(url, function onBody(error, response, body) {
      if (error) {
        cb(error);
        return;
      } else if (response.statusCode != 200) {
        cb({status: response.statusCode});
        return;
      }

      var marketRes = JSON.parse(body);
      var meta = marketRes.meta;
      var allApps = marketRes.objects;
      var app = null;
      for(var i = 0; i < allApps.length; i++) {
        app = allApps[i];
        if (app.device_types.indexOf('firefoxos') == -1) {
          continue;
        }

        apps.push(app);
      }

      if (meta.next) {
        recursiveFetch(HOST + meta.next, apps, cb);
      } else {
        cb(null, apps);
      }
    });
  };

  var fetch = function fetch(cb) {
    recursiveFetch(BASE_URL, [], cb);
  }


  return {
    fetch: fetch
  };

}();

MarketPlaceIngestor.fetch(function onFetch(err, result) {
  if (err) {
    console.error(err);
    return;
  }
  //console.log('Fetched ' + result.length + ' firefox os apps');
  console.log(JSON.stringify(result));
});