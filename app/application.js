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
          var n = Math.floor(ev.data.progress / 5);
          if (ev.data.progress < 100) {
            $('#progress').html('<span class="progress">' + new Array(n).join('<span class="loaded">█</span>') + new Array(21 - n).join('<span class="loading">█</span>')+'</span> - ' + ev.data.file + ' - LOADING...');
          } else {
            $('#progress').html('<span class="progress">' + new Array(n).join('<span class="loaded">█</span>') + new Array(21 - n).join('<span class="loading">█</span>')+'</span> - ' + ev.data.file + ' - COMPLETED');
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
