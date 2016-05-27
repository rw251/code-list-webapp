module.exports = {
  // See http://brunch.io for documentation.
  files: {
    javascripts: {
      joinTo: {
        'libraries.js': /^(?!app\/)/,
        'app.js': /^app\//
      },
      order: {
        before: [
          /jquery/
        ],
        after: [
          /cytoscape-qtip/
        ]
      }
    },
    stylesheets: { joinTo: 'app.css' },
    templates: { joinTo: 'app.js' }
  },

  modules: {
    wrapper: function(path, data) {
      if(path === 'scripts/dataloader.js')
       return 'require.register("' + path + '", function(exports, require, module) {\n' + data + '\n});\n\n';
      else if(path === "webworkify/index.js")
        return '';
      return 'require.register("' + path + '", function(exports, require, module) {\n' + data + '\n});\n\n';
    }
  }
};
