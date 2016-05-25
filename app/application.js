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
