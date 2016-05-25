(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = null;
    hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("application.js", function(exports, require, module) {
/* jshint node: true */
/* global document, Worker */
"use strict";

var $ = require('jquery');
//var work = require('scripts/worker.js');

var timer = {
  last: new Date(),
  obj: null
};

var App = {
  init: function init() {

    var loader = new Worker('workers/dataloader.js'); // work(require('scripts/dataloader'));
    loader.addEventListener('message', function(ev) {
      if (ev.data.indexLoaded) {
        $('#search').on('input', function(e) {
          var searchBoxBalue = $(this).val();
          var now = new Date();
          if (now - timer.last < 150 && timer.obj) {
            console.log("clearing last");
            clearTimeout(timer.obj);
          }
          timer.last = now;
          if (searchBoxBalue.length > 2) {
            timer.obj = setTimeout(function() {
              loader.postMessage({ cmd: "search", text: searchBoxBalue });
            }, 150);
          } else
            $('#results').html('');
        });
      } else if (ev.data.results) {
        $('#results').html('');
        ev.data.results.forEach(function(v) {
          $('#results').append("<div>" + v.code + ": " + v.description + "</div>");
        });
        console.log("Num: " + ev.data.results.length);
      } else if (ev.data.progress) {
        //console.log(ev.data);
        if (ev.data.file) {
          if (ev.data.progress < 100) {
            $('#message').append('<div>Loading ' + ev.data.file + '</div>');
          } else {
            $('#message').append('<div>' + ev.data.file + ' loaded</div>');
          }
        } else {
          //console.log(ev.data.loaded, ev.data.total);
          var n = Math.floor(ev.data.progress / 5);
          $('#progress').html(new Array(n).join("+") + new Array(20 - n).join("-"));
        }
      } else {
        console.log(ev.data);
      }
    });

    loader.postMessage({ cmd: "load", url: document.URL }); // send the worker a message
  }
};

module.exports = App;


});

require.register("scripts/dataloader.js", function(exports, require, module) {
module.exports = function(self, $) {

  var updateProgress = function(e) {
    if (e.lengthComputable) {
      //evt.loaded the bytes browser receive
      //evt.total the total bytes seted by the header
      //
      //var percentComplete = (evt.loaded / evt.total) * 100;
      //$('#progressbar').progressbar("option", "value", percentComplete);
      self.postMessage({progress:e.loaded});
    }
  };

  var loadJSON = function(url, callback) {
    console.time("Loading: " + url);
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onprogress = updateProgress;
    xmlhttp.open('GET', url, true);
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4) {
        console.timeEnd("Loading: " + url);
        if (xmlhttp.status == 200) {
          try {
            var obj = JSON.parse(xmlhttp.responseText);
            return callback(null, obj);
          } catch (e) {
            return callback(e);
          }
        }
      }
    };
    xmlhttp.send(null);
  };

  console.time("importing lunr.js");
  importScripts('https://cdnjs.cloudflare.com/ajax/libs/lunr.js/0.7.1/lunr.min.js');
  console.timeEnd("importing lunr.js");

  self.loadIndex = function(url, callback) {
    loadJSON(url + 'data/data_index.json', function(err, index) {
      if (err) {
        return callback(err);
      } else {
        console.time("loading index");
        self.index = lunr.Index.load(index);
        console.timeEnd("loading index");
        return callback(null);
      }
    });
  };

  self.loadGraph = function(url, callback) {
    console.time("loading graph");
    loadJSON(url + 'data/data_graph.json', function(err, graph) {
      if (err) {
        return callback(err);
      } else {
        self.graph = graph;
        return callback(null);
      }
    });
  };

  self.load = function(url, callback) {
    self.loadGraph(url, function(err) {
      if (err) return callback(err);
      self.loadIndex(url, function(err) {
        if (err) return callback(err);
        return callback(null);
      });
    });
  };

  self.addEventListener('message', function(e) {
    var data = e.data;
    switch (data.cmd) {
      case 'loadGraph':
        self.postMessage('WORKER STARTED: ' + data.cmd);
        self.loadGraph(data.url, function(err) {
          if (err) {
            self.postMessage('WORKER ERROR: ' + err);
          } else {
            self.postMessage('WORKER GRAPH LOADED');
          }
        });
        break;
      case 'loadIndex':
        self.postMessage('WORKER STARTED: ' + data.cmd);
        self.loadIndex(data.url, function(err) {
          if (err) {
            self.postMessage('WORKER ERROR: ' + err);
          } else {
            self.postMessage('WORKER INDEX LOADED');
          }
        });
        break;
      case 'load':
        self.postMessage('WORKER STARTED: ' + data.cmd);
        self.load(data.url, function(err, graph, index) {
          if (err) {
            self.postMessage('WORKER ERROR: ' + err);
          } else {
            self.postMessage({ indexLoaded: true });
          }
        });
        break;
      case 'search':
        self.postMessage('WORKER STARTED: ' + data.cmd + ' - ' + data.text);
        if (!self.index) {
          self.postMessage('Index not ready');
        } else {
          self.postMessage({
            results: self.index.search(data.text).map(function(v) {
              return { code: v.ref, description: self.graph[v.ref].d };
            })
          });
        }
        break;
      default:
        self.postMessage('Unknown command: ' + data.msg);
    }
  });
};


});

require.register("scripts/worker.js", function(exports, require, module) {
module.exports = function (fn) {
    var src = '('+fn+')(self)\n\n//# sourceMappingURL: name.js';

    var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

    var blob = new Blob([src], { type: 'text/javascript' });
    var workerUrl = URL.createObjectURL(blob);
    var worker = new Worker(workerUrl);
    if (typeof URL.revokeObjectURL == "function") {
      URL.revokeObjectURL(workerUrl);
    }
    return worker;
};


});

require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map