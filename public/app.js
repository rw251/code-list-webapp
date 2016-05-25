!function(){"use strict";var e="undefined"==typeof window?global:window;if("function"!=typeof e.require){var n={},t={},r={},s={}.hasOwnProperty,a=/^\.\.?(\/|$)/,o=function(e,n){for(var t,r=[],s=(a.test(n)?e+"/"+n:n).split("/"),o=0,i=s.length;i>o;o++)t=s[o],".."===t?r.pop():"."!==t&&""!==t&&r.push(t);return r.join("/")},i=function(e){return e.split("/").slice(0,-1).join("/")},l=function(n){return function(t){var r=o(i(n),t);return e.require(r,n)}},c=function(e,n){var r=null;r=R&&R.createHot(e);var s={id:e,exports:{},hot:r};return t[e]=s,n(s.exports,l(e),s),s.exports},d=function(e){return r[e]?d(r[e]):e},u=function(e,n){return d(o(i(e),n))},p=function(e,r){null==r&&(r="/");var a=d(e);if(s.call(t,a))return t[a].exports;if(s.call(n,a))return c(a,n[a]);throw new Error("Cannot find module '"+e+"' from '"+r+"'")};p.alias=function(e,n){r[n]=e};var f=/\.[^.\/]+$/,g=/\/index(\.[^\/]+)?$/,m=function(e){if(f.test(e)){var n=e.replace(f,"");s.call(r,n)&&r[n].replace(f,"")!==n+"/index"||(r[n]=e)}if(g.test(e)){var t=e.replace(g,"");s.call(r,t)||(r[t]=e)}};p.register=p.define=function(e,r){if("object"==typeof e)for(var a in e)s.call(e,a)&&p.register(a,e[a]);else n[e]=r,delete t[e],m(e)},p.list=function(){var e=[];for(var t in n)s.call(n,t)&&e.push(t);return e};var R=e._hmr&&new e._hmr(u,p,n,t);p._cache=t,p.hmr=R&&R.wrap,p.brunch=!0,e.require=p}}(),function(){window;require.register("application.js",function(e,n,t){"use strict";var r=n("jquery"),s={last:new Date,obj:null},a={init:function(){var e=new Worker("workers/dataloader.js");e.addEventListener("message",function(n){if(n.data.indexLoaded)r("#search").on("input",function(n){var t=r(this).val(),a=new Date;a-s.last<150&&s.obj&&(console.log("clearing last"),clearTimeout(s.obj)),s.last=a,t.length>2?s.obj=setTimeout(function(){e.postMessage({cmd:"search",text:t})},150):r("#results").html("")});else if(n.data.results)r("#results").html(""),n.data.results.forEach(function(e){r("#results").append("<div>"+e.code+": "+e.description+"</div>")}),console.log("Num: "+n.data.results.length);else if(n.data.progress){if(n.data.file){var t=Math.floor(n.data.progress/5);n.data.progress<100?r("#progress").html('<span class="progress">'+new Array(t).join('<span class="loaded">█</span>')+new Array(21-t).join('<span class="loading">█</span>')+"</span> - "+n.data.file+" - LOADING..."):r("#progress").html('<span class="progress">'+new Array(t).join('<span class="loaded">█</span>')+new Array(21-t).join('<span class="loading">█</span>')+"</span> - "+n.data.file+" - COMPLETED")}}else console.log(n.data)}),e.postMessage({cmd:"load",url:document.URL})}};t.exports=a}),require.register("scripts/dataloader.js",function(e,n,t){t.exports=function(e,n){var t=function(n){n.lengthComputable&&e.postMessage({progress:n.loaded})},r=function(e,n){console.time("Loading: "+e);var r=new XMLHttpRequest;r.onprogress=t,r.open("GET",e,!0),r.onreadystatechange=function(){if(4==r.readyState&&(console.timeEnd("Loading: "+e),200==r.status))try{var t=JSON.parse(r.responseText);return n(null,t)}catch(s){return n(s)}},r.send(null)};console.time("importing lunr.js"),importScripts("https://cdnjs.cloudflare.com/ajax/libs/lunr.js/0.7.1/lunr.min.js"),console.timeEnd("importing lunr.js"),e.loadIndex=function(n,t){r(n+"data/data_index.json",function(n,r){return n?t(n):(console.time("loading index"),e.index=lunr.Index.load(r),console.timeEnd("loading index"),t(null))})},e.loadGraph=function(n,t){console.time("loading graph"),r(n+"data/data_graph.json",function(n,r){return n?t(n):(e.graph=r,t(null))})},e.load=function(n,t){e.loadGraph(n,function(r){return r?t(r):void e.loadIndex(n,function(e){return t(e?e:null)})})},e.addEventListener("message",function(n){var t=n.data;switch(t.cmd){case"loadGraph":e.postMessage("WORKER STARTED: "+t.cmd),e.loadGraph(t.url,function(n){n?e.postMessage("WORKER ERROR: "+n):e.postMessage("WORKER GRAPH LOADED")});break;case"loadIndex":e.postMessage("WORKER STARTED: "+t.cmd),e.loadIndex(t.url,function(n){n?e.postMessage("WORKER ERROR: "+n):e.postMessage("WORKER INDEX LOADED")});break;case"load":e.postMessage("WORKER STARTED: "+t.cmd),e.load(t.url,function(n,t,r){n?e.postMessage("WORKER ERROR: "+n):e.postMessage({indexLoaded:!0})});break;case"search":e.postMessage("WORKER STARTED: "+t.cmd+" - "+t.text),e.index?e.postMessage({results:e.index.search(t.text).map(function(n){return{code:n.ref,description:e.graph[n.ref].d}})}):e.postMessage("Index not ready");break;default:e.postMessage("Unknown command: "+t.msg)}})}}),require.register("scripts/worker.js",function(e,n,t){t.exports=function(e){var n="("+e+")(self)\n\n//# sourceMappingURL: name.js",t=window.URL||window.webkitURL||window.mozURL||window.msURL,r=new Blob([n],{type:"text/javascript"}),s=t.createObjectURL(r),a=new Worker(s);return"function"==typeof t.revokeObjectURL&&t.revokeObjectURL(s),a}}),require.register("___globals___",function(e,n,t){})}(),require("___globals___");