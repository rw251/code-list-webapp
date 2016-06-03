/* jshint node: true */
/* global document, Worker */
"use strict";

var $ = require('jquery'),
  Graph = require('scripts/Graph'),
  layout = {},
  timer = {
    last: new Date(),
    obj: null
  },
  graph = new Graph();

var App = {
  init: function init() {

    switch ($("input[type='radio'][name='graph']:checked").val()) {
      case 'cyto':
        layout = require('scripts/graphCyto');
        break;
      default:
        layout = require('scripts/graphViva');
    }

    layout.init($('#cy'));
    layout.test();

    $("input[type='radio'][name='graph']").change(function(e, a, b) {
      layout.clear();
      if (this.value == 'cyto') {
        layout = require('scripts/graphCyto');
      } else {
        layout = require('scripts/graphViva');
      }
      layout.init($('#cy'));
      layout.test();
    });

    var loader = new Worker('workers/dataloader.js'); // work(require('scripts/dataloader'));
    loader.addEventListener('message', function(ev) {
      if (ev.data.indexLoaded) {
        //window.g = ev.data.graph;

        $('#search').removeClass('bg-danger').on('input', function(e) {
          var searchBoxValue = $(this).val();
          var now = new Date();
          if (now - timer.last < 150 && timer.obj) {
            console.log("clearing last");
            clearTimeout(timer.obj);
          }
          timer.last = now;
          /*if (searchBoxValue.split(" ").filter(function(v){
            return v.length<=2;
          }).length === 0) {*/
          if (searchBoxValue.length > 2) {
            timer.obj = setTimeout(function() {
              loader.postMessage({ cmd: "search", text: searchBoxValue });
            }, 150);
          } //else
          //$('#results').html('');
        });
      } else if (ev.data.graph) {
        layout.clear();
        Object.keys(ev.data.graph).forEach(function(v) {
          if (ev.data.graph[v].children.length > 0) {
            ev.data.graph[v].children.forEach(function(vv) {
              layout.addNodes({
                id: v,
                label: ev.data.graph[v].description
              }, {
                id: vv,
                label: ev.data.graph[vv].description
              });
            });
          }
        });
        layout.layout(function(id) {
          loader.postMessage({ cmd: "graph", node: id });
        });
      } else if (ev.data.results && ev.data.results.length > 0) {
        console.time('Display graph');


        loader.postMessage({ cmd: "graph", node: ev.data.results[0].code });

        /*ev.data.results.forEach(function(v) {
          graph.addNode(v.code);
          graph.addNode(v.parent);

          //if (meta.excludedCodes) {
          //  if (meta.excludedCodes.indexOf(v.code) > -1) graph.prop(v.code, "include", false);
          //  if (meta.excludedCodes.indexOf(v.parent) > -1) graph.prop(v.parent, "include", false);
          //}
          //if (meta.includedCodes) {
          //  if (meta.includedCodes.indexOf(v.code) > -1) graph.prop(v.code, "include", true);
          //  if (meta.includedCodes.indexOf(v.parent) > -1) graph.prop(v.parent, "include", true);
          //}

          graph.prop(v.code, "match", true);

          if (graph.prop(v.code, "description").indexOf(v.description) === -1) graph.prop(v.code, "description").push(v.description);
          if (graph.prop(v.parent, "description").indexOf(v.parentDescription) === -1) graph.prop(v.parent, "description").push(v.parentDescription);

          if (graph.prop(v.parent, "children").indexOf(v.code) === -1) graph.prop(v.parent, "children").push(v.code);
          if (graph.prop(v.code, "parent").indexOf(v.parent) === -1) graph.prop(v.code, "parent").push(v.parent);

          //adds A->B
          layout.addNodes({
            id: v.parent,
            label: v.description
          }, {
            id: v.code,
            label: v.description
          });

        });*/
        //layout.layout();
        console.timeEnd('Display graph');

        console.time('Display results');

        $('#results').html('');
        ev.data.results.forEach(function(v) {
          $('#results').append("<div>" + v.code + ": " + v.description + "</div>");
        });

        console.timeEnd('Display results');
      } else if (ev.data.progress) {
        //console.log(ev.data);
        if (ev.data.file) {
          var n = Math.floor(ev.data.progress / 2);
          if (ev.data.progress < 100) {
            $('#progress').html('<span class="progress">' + new Array(n).join('<span class="loaded">█</span>') + new Array(51 - n).join('<span class="loading">█</span>') + '</span> - ' + ev.data.file + ' - LOADING...');
          } else {
            $('#progress').html('<span class="progress">' + new Array(n).join('<span class="loaded">█</span>') + new Array(51 - n).join('<span class="loading">█</span>') + '</span> - ' + ev.data.file + ' - COMPLETED');
          }
        }
      } else {
        console.log(ev.data);
      }
    });

    loader.postMessage({ cmd: "load", url: document.URL }); // send the worker a message
  }
};

module.exports = App;
