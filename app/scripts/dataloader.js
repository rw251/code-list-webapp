module.exports = function(self, $) {

  var loadJSON = function(url, callback) {
    console.time("Loading: " + url);
    var xmlhttp = new XMLHttpRequest();
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
            self.postMessage({indexLoaded:true});
          }
        });
        break;
      case 'search':
        self.postMessage('WORKER STARTED: ' + data.cmd + ' - ' + data.text);
        if (!self.index) {
          self.postMessage('Index not ready');
        } else {
          self.postMessage({results: self.index.search(data.text).map(function(v) {
            return {code: v.ref, description: self.graph[v.ref].d};
          })});
        }
        break;
      default:
        self.postMessage('Unknown command: ' + data.msg);
    }
  });
};