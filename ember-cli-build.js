'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  let app = new EmberAddon(defaults, {
    postcssOptions: {
      compile: {
        plugins: [
          require('stylelint'),
          {
            module: require('postcss-import'),
            options: {
              path: ['node_modules']
            }
          },
          require('tailwindcss'),
          require('autoprefixer'),
          require('postcss-reporter')({ clearReportedMessages: true }),
        ]
      }
    },
    'ember-composable-helpers': {
      only: ['repeat', 'toggle'],
    },
    'ember-math-helpers': {
      only: ['random'],
    }
  });

  return app.toTree();
};
