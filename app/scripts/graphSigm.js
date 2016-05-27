var sigma = require('sigma');

var sg = {

  init: function(el) {
    el.html("");
    el.removeAttr("style");
    sg.s = new sigma({ container: el });
  },

  clear: function() {
    sg.s.graph.clear();
  },

  test: function() {
    // Then, let's add some data to display:
    sg.s.graph.addNode({
      // Main attributes:
      id: 'n0',
      label: 'Hello',
      // Display attributes:
      size: 10,
      color: '#f00'
    }).addNode({
      // Main attributes:
      id: 'n1',
      label: 'World !',
      // Display attributes:
      size: 10,
      color: '#00f'
    }).addEdge({
      id: 'e0',
      // Reference extremities:
      source: 'n0',
      target: 'n1'
    });
    console.log(sg.s.graph.nodes(), sg.s.graph.edges());
    // Finally, let's ask our sigma instance to refresh:
    sg.s.refresh();
  },

  addNodes: function(A, B) {
    if (!sg.s.graph.nodes(A.id)) {
      sg.s.graph.addNode({
        // Main attributes:
        id: A.id,
        label: 'Hello',
        // Display attributes:
        x: 0,
        y: 0,
        size: 1,
        color: '#f00'
      });
    }
    if (!sg.s.graph.nodes(B.id)) {
      sg.s.graph.addNode({
        // Main attributes:
        id: B.id,
        label: 'Hello',
        // Display attributes:
        x: 0,
        y: 0,
        size: 1,
        color: '#f00'
      });
    }
    sg.s.graph.addEdge({
      id: A.id + '-' + B.id,
      // Reference extremities:
      source: A.id,
      target: B.id
    });
  },

  layout: function() {
    sg.s.refresh();
  }

};

module.exports = sg;
