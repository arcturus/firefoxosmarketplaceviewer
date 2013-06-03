var AppController = function AppController() {

  var stats = null;
  var hosted = null;
  var packaged = null;
  var navSections = ['#stats', '#packaged', '#hosted'];

  var init = function init() {
    window.addEventListener('hashchange', function onHasChange() {
      var hash = document.location.hash;
      if (navSections.indexOf(hash) == -1) {
        hash = '#stats';
      }
      $('section:not(' + hash + ')').hide();
      $(hash).show();
      $('#nav_menu li').removeClass('active');
      $('a[href=' + hash + ']').parent().addClass('active');

      if (hash == '#hosted') {
        showHosted();
      } else if (hash == '#packaged') {
        showPackaged();
      }
    });
  };

  var showPackaged = function showHosted() {
    if (packaged != null) {
      return;
    }

    $.ajax({
      'url': '/api/apps/packaged',
      'dataType': 'json'
    }).done(function onHosted(data) {
      packaged = data;
      displayPackaged();
    });
  };

  var displayPackaged = function displayPackaged() {
    displayApps('packaged', packaged);
  };

  var showHosted = function showHosted() {
    if (hosted != null) {
      return;
    }

    $.ajax({
      'url': '/api/apps/hosted',
      'dataType': 'json'
    }).done(function onHosted(data) {
      hosted = data;
      displayHosted();
    });
  };

  var displayHosted = function displayHosted() {
    displayApps('hosted', hosted);
  };

  var displayApps = function displayApps(kind, apps) {
    var div = $('#' + kind + '_area');
    var ul = null;
    var app;

    for(var i = 0; i < apps.length; i++) {
      app = apps[i];
      if (i % 3 == 0) {
        if (ul != null) {
          div.append(ul);
        }
        ul = $('<ul class="thumbnails"/>');
      }

      var li = $('<li class="span4"/>');

      var thumb = $('<div class="thubmnail"/>');
      var img = $('<img/>');
      img.attr('src', app.previews[0].thumbnail_url);
      thumb.append(img);

      var caption = $('<div class="caption"/>');
      caption.append('<h3>' + app.name + '</h3>');
      caption.append('<p>' + app.summary + '</p>');
      thumb.append(caption);
      if (app.extra && app.extra.enhanced && app.extra.enhanced.app_cache_defined) {
        var appcache_defined = $('<button class="btn btn-info">With app cache defined</button>');
        thumb.append(appcache_defined);
      } else if (app.extra && app.extra.enhanced && app.extra.enhanced.uses_appcache) {
        var using_appcache = $('<button class="btn btn-danger">App cache not defined but used</button>');
        thumb.append(using_appcache);
      }

      li.append(thumb);

      ul.append(li);

    }

    if (ul != null) {
      div.append(ul);
    }
  };

  var showStats = function showStats() {
    if (stats != null) {
      displayStats();
      return;
    }

    $.ajax({
      'url': '/api/stats',
      'dataType': 'json'
    }).done(function onStats(data) {
      stats = data;
      displayStats();
    });
  };

  var displayStats = function displayStats() {
    var div = $('#stats_area');
    div.innerHTML = '';

    var progress = document.createElement('div');
    progress.classList.add('progress');

    var totalDiv = document.createElement('div');
    totalDiv.classList.add('alert');
    totalDiv.classList.add('alert-info');
    totalDiv.innerHTML = '<span>Total Firefox OS apps </span><strong>' + stats.total +'</strong>';
    div.append(totalDiv);

    var hostedDiv = document.createElement('div');
    hostedDiv.classList.add('alert');
    hostedDiv.classList.add('alert-block');
    hostedDiv.innerHTML = '<span>Hosted apps </span><strong>' + stats.hosted +'</strong>';
    div.append(hostedDiv);
    var progressHosted = document.createElement('div');
    progressHosted.classList.add('bar');
    progressHosted.classList.add('bar-warning');
    progressHosted.style.width =  Math.round(stats.hosted * 100 / stats.total) + '%';
    progressHosted.innerHTML =  Math.round(stats.hosted * 100 / stats.total) + '%';
    progress.appendChild(progressHosted);

    var packagedDiv = document.createElement('div');
    packagedDiv.classList.add('alert');
    packagedDiv.classList.add('alert-success');
    packagedDiv.innerHTML = '<span>Packaged apps </span><strong>' + stats.packaged +'</strong>';
    div.append(packagedDiv);
    var progressPackaged = document.createElement('div');
    progressPackaged.classList.add('bar');
    progressPackaged.classList.add('bar-success');
    progressPackaged.style.width = Math.round(stats.packaged * 100 / stats.total) + '%';
    progressPackaged.innerHTML = Math.round(stats.packaged * 100 / stats.total) + '%';
    progress.appendChild(progressPackaged);

    var unknownDiv = document.createElement('div');
    unknownDiv.classList.add('alert');
    unknownDiv.classList.add('alert-error');
    unknownDiv.innerHTML = '<span>Unknown apps </span><strong>' + stats.unknown +'</strong>';
    div.append(unknownDiv);
    var progressUnknwon = document.createElement('div');
    progressUnknwon.classList.add('bar');
    progressUnknwon.classList.add('bar-danger');
    progressUnknwon.style.width = Math.round(stats.unknown * 100 / stats.total) + '%';
    progressUnknwon.innerHTML = Math.round(stats.unknown * 100 / stats.total) + '%';
    progress.appendChild(progressUnknwon);
    
    div.append(progress);

    var hostedArea = $('#appcache_area');
    var progressAppCache = document.createElement('div');
    progressAppCache.classList.add('progress');

    var totalHosted = document.createElement('div');
    totalHosted.classList.add('alert');
    totalHosted.classList.add('alert-info');
    totalHosted.innerHTML = '<span>Total Firefox OS hosted apps </span><strong>' + stats.hosted +'</strong>';
    hostedArea.append(totalHosted);
    var progressWithoutAppCache = document.createElement('div');
    progressWithoutAppCache.classList.add('bar');
    progressWithoutAppCache.classList.add('bar-warning');
    progressWithoutAppCache.style.width = Math.round((stats.hosted - stats.appcache_defined) * 100 / stats.hosted) + '%';
    progressWithoutAppCache.innerHTML = Math.round((stats.hosted - stats.appcache_defined) * 100 / stats.hosted) + '%';
    progressAppCache.appendChild(progressWithoutAppCache);

    var withAppCache = document.createElement('div');
    withAppCache.classList.add('alert');
    withAppCache.classList.add('alert-success');
    withAppCache.innerHTML = 'Hosted apps with <strong>app cache defined</strong> ' + stats.appcache_defined
    hostedArea.append(withAppCache);
    var progressWithAppCache = document.createElement('div');
    progressWithAppCache.classList.add('bar');
    progressWithAppCache.classList.add('bar-success');
    progressWithAppCache.style.width = Math.round(stats.appcache_defined * 100 / stats.hosted) + '%';
    progressWithAppCache.innerHTML = Math.round(stats.appcache_defined * 100 / stats.hosted) + '%';
    progressAppCache.appendChild(progressWithAppCache);

    hostedArea.append(progressAppCache);

    var offlineArea = $('#offline_area');
    var totalOffline = stats.packaged + stats.appcache_defined;
    var progressOffline = document.createElement('div');
    progressOffline.classList.add('progress');

    var progressOfflineOnline = document.createElement('div');
    progressOfflineOnline.classList.add('bar');
    progressOfflineOnline.classList.add('bar-warning');
    progressOfflineOnline.style.width = Math.round((stats.total - totalOffline) * 100 / stats.total) + '%';
    progressOfflineOnline.innerHTML = Math.round((stats.total - totalOffline) * 100 / stats.total) + '%';
    progressOffline.appendChild(progressOfflineOnline);

    var progressOfflineOffline = document.createElement('div');
    progressOfflineOffline.classList.add('bar');
    progressOfflineOffline.classList.add('bar-success');
    progressOfflineOffline.style.width = Math.round(totalOffline * 100 / stats.total) + '%';
    progressOfflineOffline.innerHTML = Math.round(totalOffline * 100 / stats.total) + '%';
    progressOffline.appendChild(progressOfflineOffline);

    offlineArea.append(progressOffline);

    var appCacheArea = $('#hosted_appcache_area');
    var totalHostedOnline = stats.without_appcache_defined;
    var progressUsingAppCache = document.createElement('div');
    progressUsingAppCache.classList.add('progress');

    var progressCacheOff = document.createElement('div');
    progressCacheOff.classList.add('bar');
    progressCacheOff.classList.add('bar-warning');
    progressCacheOff.style.width = Math.round((totalHostedOnline - 
      stats.without_appcache_defined_using_appcache) * 100 / totalHostedOnline) + '%';
    progressCacheOff.innerHTML = Math.round((stats.without_appcache_defined - 
      stats.without_appcache_defined_using_appcache) * 100 / totalHostedOnline) + '%';
    progressUsingAppCache.appendChild(progressCacheOff);

    var progressCacheOn = document.createElement('div');
    progressCacheOn.classList.add('bar');
    progressCacheOn.classList.add('bar-success');
    progressCacheOn.style.width = Math.round(stats.without_appcache_defined_using_appcache * 100 / 
      totalHostedOnline) + '%';
    progressCacheOn.innerHTML = Math.round(stats.without_appcache_defined_using_appcache * 100 / 
      totalHostedOnline) + '%';
    progressUsingAppCache.appendChild(progressCacheOn);

    appCacheArea.append(progressUsingAppCache);

    div.show();
    hostedArea.show();
    offlineArea.show();
    appCacheArea.show();

  };

  return {
    'init': init,
    'showStats': showStats
  };

}();

AppController.init();
AppController.showStats();