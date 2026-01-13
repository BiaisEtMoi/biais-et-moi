define(['pipAPI', 'pipScorer', 'underscore'], function (APIConstructor, Scorer, _) {
  console.log("Loading IAT script...");

  // Return an init function that accepts configuration
  return {
    init: function (config) {

      // Load the IAT5 extension and activatePIP
      require(['activatePIP', 'iat5'], function (activatePIP, iatExtension) {
        console.log("IAT5 extension loaded");

        const options = {
          category1: config.category1,
          category2: config.category2,
          attribute2: config.attribute2,
          attribute1: config.attribute1,

          fontColor: '#000000', //The default color used for printed messages.

          //Instructions text.
          instCategoriesPractice: config.steps.step1,
          instAttributePractice: config.steps.step2,
          instFirstCombined: config.steps.stepFirstCombined,
          instSecondCombined: config.steps.stepSecondCombined,
          instSwitchCategories: config.steps.stepSwitchCategories,
          canvas: {
            maxWidth: 725,
            proportions: 0.7,
            background: '#ffffff',
            borderWidth: 5,
            canvasBackground: '#ffffff',
            borderColor: 'lightblue'
          },

          base_url: {//Where are your images at?
            image: '/images/'
          },

          orText: 'ou',
        }

        if (config.devMode) {
          // Reduce the number of trials for quicker testing in dev mode
          Object.assign(options, {
            blockAttributes_nTrials: 1,
            blockAttributes_nMiniBlocks: 1,
            blockCategories_nTrials: 1,
            blockCategories_nMiniBlocks: 1,
            blockFirstCombined_nTrials: 1,
            blockFirstCombined_nMiniBlocks: 1,
            blockSecondCombined_nTrials: 1, //Not used if nBlocks=5.
            blockSecondCombined_nMiniBlocks: 1, //Not used if nBlocks=5.
            blockSwitch_nTrials: 1,
            blockSwitch_nMiniBlocks: 1,
          })
        }
        Object.assign(options, config.translations || {})

        // Call the IAT extension with the provided configuration
        var script = iatExtension(options);

        // Activate PIPlayer with the script
        activatePIP(script);

        console.log("IAT initialized and playing");
      });
    }
  };
});


