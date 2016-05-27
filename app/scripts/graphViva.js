var Viva = require('vivagraphjs');



var gv = {

  init: function(el) {
    el.html("");
    
    gv.g = Viva.Graph.graph();
    var nodeSize = 10;
    var graphics = Viva.Graph.View.svgGraphics();
    graphics.node(function(node) {
        var ui = Viva.Graph.svg('g'),

          svgText = Viva.Graph.svg('text').attr('y', '-15px').attr('x', '-' + (nodeSize / 4) + 'px').text(node.data ? node.data.label : "label");

        titleTXT = Viva.Graph.svg('text').attr('y', '-3px').attr('x', '-' + (nodeSize / 4) + 'px').text(node.id)
          .attr('fill', '#2CA1F4');

        img = Viva.Graph.svg('rect').attr('width', nodeSize).attr('height', nodeSize).attr('fill', '#1A8CE1');


        ui.append(svgText);
        ui.append(titleTXT);
        ui.append(img);

        /*$(ui).dblclick(function(e) {
          window.open(node.data.anchor, '_blank');
        });*/

        return ui;
      })
      .placeNode(function(nodeUI, pos) {
        nodeUI.attr('transform', 'translate(' + (pos.x - nodeSize / 2) + ',' + (pos.y - nodeSize / 2) + ')');
      });

    gv.r = Viva.Graph.View.renderer(gv.g, {
      container: document.getElementById(el.attr("id")),
      graphics: graphics
    });
  },

  test: function() {
    gv.g.addLink(1, 2);
    gv.r.run();
  },

  clear: function() {
    gv.g.clear();
  },

  addNodes: function(A, B) {
    gv.g.addNode(A.id, { label: A.label });
    gv.g.addNode(B.id, { label: B.label });
    gv.g.addLink(A.id, B.id);
  },

  layout: function() {
    gv.r.run();
  }

};

module.exports = gv;
