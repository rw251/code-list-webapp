/* jshint node: true */
"use strict";

require("./Array");

var Graph = function() {
  this.graph = {};

  this.nodes = function() {
    return Object.keys(this.graph);
  };

  this.hasNode = function(node) {
    return this.nodes().indexOf(node) > -1;
  };

  this.addNode = function(nodeName, node) {
    //Add node to graph if not already exists
    if (!this.hasNode(nodeName)) {
      if (node) {
        //adding an existing node
        this.graph[nodeName] = node;
      } else {
        //adding a new node
        this.graph[nodeName] = {
          description: [],
          children: [],
          parent: []
        };
      }
    }
  };

  this.prop = function(node, prop, value) {
    if (this.hasNode(node)) {
      if (value === undefined) {
        return this.graph[node][prop];
      } else {
        this.graph[node][prop] = value;
      }
    }
  };

  this.propDelete = function(node, prop) {
    if (this.hasNode(node)) {
      delete this.graph[node][prop];
    }
  };

  this.node = function(nodeName) {
    return this.graph[nodeName];
  };

  this.merge = function(graphs) {
    var self = this;
    if (!Array.isArray(graphs)) {
      graphs = [graphs];
    }
    graphs.forEach(function(graph) {
      graph.nodes().forEach(function(node) {
        self.addNode(node, graph.node(node));
      });
    });
  };

  this.included = function() {
    var self = this;
    return [].concat(this.nodes().filter(function(node) {
      return self.node(node).include;
    }));
  };

  this.excluded = function() {
    var self = this;
    return [].concat(this.nodes().filter(function(node) {
      return !self.node(node).include;
    }));
  };

  // For a graph G we return an array of connected subgraphs
  this.connectedSubgraphs = function() {
    var i, j, u, v, rtn = [],
      Q = [],
      G = this;

    G.nodes().forEach(function(node) {
      G.prop(node, "unvisited", true);
    });

    G.nodes().forEach(function(node) {
      if (!G.prop(node, "unvisited")) return;

      var subGraph = new Graph();
      Q.push(node);

      while (Q.length > 0) {
        u = Q.splice(0, 1)[0];
        subGraph.addNode(u, G.node(u));
        var edges = G.prop(u, "children").concat(G.prop(u, "parent"));
        for (i = 0; i < edges.length; i += 1) {
          v = edges[i];
          if (G.prop(v, "unvisited")) {
            G.propDelete(v, "unvisited");
            Q.push(v);
          }
        }
      }
      rtn.push(subGraph);
    });

    return rtn;
  };

  //dfs on tree to output all children
  this.getDescendents = function(v) {
    var i, j, u, status,
      rtn = [],
      G = this,
      Q = [].concat(G.prop(v, "children"));

    G.nodes().forEach(function(node) {
      G.prop(node, "unvisited", true);
    });

    while (Q.length > 0) {
      u = Q.splice(0, 1)[0];

      if (!G.prop(u, "unvisited")) continue;
      G.propDelete(u, "unvisited");

      rtn.push(u);

      for (i = G.prop(u, "children").length - 1; i >= 0; i -= 1) {
        v = G.prop(u, "children")[i];
        if (G.prop(v, "unvisited")) {
          Q.unshift(v);
        }
      }
    }
    return rtn;
  };

  this.displayChildrenInTree = function(v) {
    //dfs on tree to output all children
    var i, j, u, status, G = this,
      Q = [].concat(G.prop(v, "children"));
    G.nodes().forEach(function(node) {
      G.prop(node, "unvisited", true);
    });

    while (Q.length > 0) {
      u = Q.splice(0, 1)[0];

      if (!G.prop(u, "unvisited")) continue;
      G.propDelete(u, "unvisited");

      status = "";
      if (G.prop(u, "include")) status = "  INCLUDED".cyan;
      if (G.prop(u, "include") === false) status = "  REJECTED".red;
      console.log(new Array(G.prop(u, "depth") * 3).join(" ") + "+-- ".white + "CHILD: ".yellow + u + "-" + G.prop(u, "description").join(" | ").yellow + status);

      var edges = G.prop(u, "children");
      for (i = edges.length - 1; i >= 0; i -= 1) {
        v = edges[i];
        if (G.prop(v, "unvisited")) {
          Q.unshift(v);
        }
      }
    }

    return;
  };

  this.addDepth = function() {
    var i, j, u, v, Q = [],
      G = this;

    G.nodes().forEach(function(node) {
      G.prop(node, "visited", 0);
      G.prop(node, "depth", 0);
    });

    G.nodes().forEach(function(node) {
      if (G.prop(node, "visited") || G.prop(node, "parent").length > 0) return;

      Q.push(node);

      while (Q.length > 0) {
        u = Q.splice(0, 1)[0];
        var edges = G.prop(u, "children");
        for (i = 0; i < edges.length; i += 1) {
          v = edges[i];
          if (G.prop(v, "visited") < G.prop(v, "parent").length - 1) {
            G.prop(v, "visited", G.prop(v, "visited") + 1);
          } else if (G.prop(v, "visited") === G.prop(v, "parent").length - 1) {
            G.propDelete(v, "visited");
            G.prop(v, "depth", G.prop(u, "depth") + 1);
            Q.push(v);
          }
        }
      }
    });

    return G;
  };
};

Graph.merge = function(graphs) {
  var g = new Graph();
  g.merge(graphs);
  return g;
};

module.exports = Graph;
