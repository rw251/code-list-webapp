var cytoscape = require('cytoscape'),
  cytoqtip = require('cytoscape-qtip'),
  cytdagre = require('cytoscape-dagre'),
  dagre = require('dagre');

window.jQuery = require('jquery');
var qtip = require('qtip2');
cytoqtip(cytoscape, window.jQuery); // register extension
cytdagre(cytoscape, dagre);

var gc = {

  init: function(el) {
    el.html("");

    gc.cy = cytoscape({

      container: el, // container to render in
      boxSelectionEnabled: false,
      autounselectify: true,
      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'background-color': 'red',
            'label': 'data(label)',
            'content': 'data(label)'
          }
        },

        {
          selector: 'edge',
          style: {
            'width': 4,
            'target-arrow-shape': 'triangle',
            'line-color': '#9dbaea',
            'target-arrow-color': '#9dbaea'
          }
				}

      ]

    });

  },

  test: function() {
    gc.cy.add([
      { group: "nodes", data: { weight: 75, id: "n1", label: "node 1" } },
      { group: "nodes", data: { weight: 75, id: "n2", label: "node 2" } },
      { group: "edges", data: { source: "n1", target: "n2" } }
    ]);
    gc.layout();
  },

  clear: function() {
    gc.cy.off('click', 'node');
    gc.cy.remove(gc.cy.elements("[weight!=50]"));
  },

  addNodes: function(A, B) {
    gc.cy.add([
      { group: "nodes", data: { weight: 75, id: A.id, label: A.label } },
      { group: "nodes", data: { weight: 75, id: B.id, label: B.label } },
      { group: "edges", data: { source: A.id, target: B.id } }
    ]);
  },

  layout: function() {
    //cy.layout({name:'cose'});
    gc.cy.layout({ name: 'dagre', nodeSep: 5, rankDir:'LR' });

    gc.cy.off('click', 'node');
    gc.cy.on('click', 'node', function(event) {
      var node = event.cyTarget;
      console.log(event);
      node.qtip({
        content: node.data('label'),
        position: {
          my: 'top center',
          at: 'bottom center',
          target: node
        },
        style: {
          classes: 'qtip-bootstrap',
          tip: {
            width: 16,
            height: 8
          }
        },
        hide: {
          event: 'unfocus'
        }
      }, event);
    });
  }

};

module.exports = gc;
