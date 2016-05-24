!function(){"use strict";var e="undefined"==typeof window?global:window;if("function"!=typeof e.require){var n={},t={},r={},o={}.hasOwnProperty,a=/^\.\.?(\/|$)/,s=function(e,n){for(var t,r=[],o=(a.test(n)?e+"/"+n:n).split("/"),s=0,i=o.length;i>s;s++)t=o[s],".."===t?r.pop():"."!==t&&""!==t&&r.push(t);return r.join("/")},i=function(e){return e.split("/").slice(0,-1).join("/")},l=function(n){return function(t){var r=s(i(n),t);return e.require(r,n)}},c=function(e,n){var r=null;r=m&&m.createHot(e);var o={id:e,exports:{},hot:r};return t[e]=o,n(o.exports,l(e),o),o.exports},u=function(e){return r[e]?u(r[e]):e},d=function(e,n){return u(s(i(e),n))},p=function(e,r){null==r&&(r="/");var a=u(e);if(o.call(t,a))return t[a].exports;if(o.call(n,a))return c(a,n[a]);throw new Error("Cannot find module '"+e+"' from '"+r+"'")};p.alias=function(e,n){r[n]=e};var f=/\.[^.\/]+$/,g=/\/index(\.[^\/]+)?$/,R=function(e){if(f.test(e)){var n=e.replace(f,"");o.call(r,n)&&r[n].replace(f,"")!==n+"/index"||(r[n]=e)}if(g.test(e)){var t=e.replace(g,"");o.call(r,t)||(r[t]=e)}};p.register=p.define=function(e,r){if("object"==typeof e)for(var a in e)o.call(e,a)&&p.register(a,e[a]);else n[e]=r,delete t[e],R(e)},p.list=function(){var e=[];for(var t in n)o.call(n,t)&&e.push(t);return e};var m=e._hmr&&new e._hmr(d,p,n,t);p._cache=t,p.hmr=m&&m.wrap,p.brunch=!0,e.require=p}}(),function(){window;require.register("application.js",function(e,n,t){"use strict";var r=n("jquery"),o=n("scripts/worker.js"),a={last:new Date,obj:null},s={init:function(){var e=o(n("scripts/dataloader"));e.addEventListener("message",function(n){n.data.indexLoaded?r("#search").on("keyup",function(n){var t=r(this).val(),o=new Date;o-a.last<150&&a.obj&&(console.log("clearing last"),clearTimeout(a.obj)),a.last=o,t.length>2?a.obj=setTimeout(function(){e.postMessage({cmd:"search",text:t})},150):r("#results").html("")}):n.data.results?(r("#results").html(""),n.data.results.forEach(function(e){r("#results").append("<div>"+e.code+": "+e.description+"</div>")}),console.log("Num: "+n.data.results.length)):console.log(n.data)}),e.postMessage({cmd:"load",url:document.URL})}};t.exports=s}),require.register("scripts/dataloader.js",function(e,n,t){t.exports=function(e,n){var t=function(e,n){console.time("Loading: "+e);var t=new XMLHttpRequest;t.open("GET",e,!0),t.onreadystatechange=function(){if(4==t.readyState&&(console.timeEnd("Loading: "+e),200==t.status))try{var r=JSON.parse(t.responseText);return n(null,r)}catch(o){return n(o)}},t.send(null)};console.time("importing lunr.js"),importScripts("https://cdnjs.cloudflare.com/ajax/libs/lunr.js/0.7.1/lunr.min.js"),console.timeEnd("importing lunr.js"),e.loadIndex=function(n,r){t(n+"data/data_index.json",function(n,t){return n?r(n):(console.time("loading index"),e.index=lunr.Index.load(t),console.timeEnd("loading index"),r(null))})},e.loadGraph=function(n,r){console.time("loading graph"),t(n+"data/data_graph.json",function(n,t){return n?r(n):(e.graph=t,r(null))})},e.load=function(n,t){e.loadGraph(n,function(r){return r?t(r):void e.loadIndex(n,function(e){return t(e?e:null)})})},e.addEventListener("message",function(n){var t=n.data;switch(t.cmd){case"loadGraph":e.postMessage("WORKER STARTED: "+t.cmd),e.loadGraph(t.url,function(n){n?e.postMessage("WORKER ERROR: "+n):e.postMessage("WORKER GRAPH LOADED")});break;case"loadIndex":e.postMessage("WORKER STARTED: "+t.cmd),e.loadIndex(t.url,function(n){n?e.postMessage("WORKER ERROR: "+n):e.postMessage("WORKER INDEX LOADED")});break;case"load":e.postMessage("WORKER STARTED: "+t.cmd),e.load(t.url,function(n,t,r){n?e.postMessage("WORKER ERROR: "+n):e.postMessage({indexLoaded:!0})});break;case"search":e.postMessage("WORKER STARTED: "+t.cmd+" - "+t.text),e.index?e.postMessage({results:e.index.search(t.text).map(function(n){return{code:n.ref,description:e.graph[n.ref].d}})}):e.postMessage("Index not ready");break;default:e.postMessage("Unknown command: "+t.msg)}})}}),require.register("scripts/worker.js",function(e,n,t){t.exports=function(e){var n="("+e+")(self)",t=window.URL||window.webkitURL||window.mozURL||window.msURL,r=new Blob([n],{type:"text/javascript"}),o=t.createObjectURL(r),a=new Worker(o);return"function"==typeof t.revokeObjectURL&&t.revokeObjectURL(o),a}}),require.register("___globals___",function(e,n,t){})}(),require("___globals___");