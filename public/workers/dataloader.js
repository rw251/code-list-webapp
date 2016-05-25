var updateProgress = function(e) {
  if (e.lengthComputable) {
    //evt.loaded the bytes browser receive
    //evt.total the total bytes seted by the header
    self.postMessage({ loaded: e.loaded, total: e.total, progress: 100 * e.loaded / e.total, file: self.file });
  } else {
    self.postMessage({ loaded: e.loaded, total: self.total, progress: 100 * e.loaded / self.total, file: self.file });
  }
};

var config = {
  READv2: {
    graph: {
      filename: "data/data_graph.json",
      nicename: "Read code graph",
      size: 11280760
    },
    index: {
      lunr: {
        filename: "data/data_index_READv2.lunr.json",
        nicename: "Read code dictionary",
        size: 56972180
      },
      elasticlunr: {
        filename: "data/data_index_READv2.elasticlunr.json",
        nicename: "Read code dictionary",
        size: 38891490
      }
    }
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
//importScripts('https://cdnjs.cloudflare.com/ajax/libs/lunr.js/0.7.1/lunr.min.js');
importScripts('/elasticlunr.min.js');
console.timeEnd("importing lunr.js");

self.loadIndex = function(url, callback) {
  self.total = config.READv2.index.elasticlunr.size;
  self.file = config.READv2.index.elasticlunr.nicename;
  loadJSON(url + config.READv2.index.elasticlunr.filename, function(err, index) {
    if (err) {
      return callback(err);
    } else {
      console.time("loading index");
      self.index = elasticlunr.Index.load(index);
      console.timeEnd("loading index");
      return callback(null);
    }
  });
};

self.loadGraph = function(url, callback) {
  self.total = config.READv2.graph.size;
  self.file = config.READv2.graph.nicename;
  loadJSON(url + config.READv2.graph.filename, function(err, graph) {
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
          results: self.index.search(data.text, { expand: true }).map(function(v) {
            return { code: v.ref, description: self.graph[v.ref].d };
          })
        });
      }
      break;
    default:
      self.postMessage('Unknown command: ' + data.msg);
  }
});
