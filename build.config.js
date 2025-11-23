({
  baseUrl: "vendors/bower_components/PIPlayer/src/js",

  paths: {
    pipAPI: 'API',
    text: '../../../requirejs-text/text',
    jquery: 'empty:',
    underscore: 'empty:',
    backbone: 'empty:',
    activatePIP: 'activatePIP',
    iatScript: '../../../../iat-script',
    iat5: '../../../../iat5'
  },

  stubModules: ['text'],

  packages: [
    {
      name: 'pipScorer',
      location: 'extensions/dscore',
      main: 'Scorer'
    }
  ],

  // The module to optimize (your entry point)
  name: "iatScript",

  // Output file
  out: "static/iat-bundle.js",

  // Include these modules in the build
  include: ['pipAPI', 'pipScorer', 'activatePIP', 'iat5'],

  // Optimize mode
  optimize: "none",  // Change to "uglify2" for production

  // Preserve license comments
  preserveLicenseComments: false,

  // Generate source maps
  generateSourceMaps: false,

  // Don't include text plugin content inline
  inlineText: true
})