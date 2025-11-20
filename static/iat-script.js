define(['pipAPI', 'pipScorer', 'underscore'], function (APIConstructor, Scorer, _) {
  console.log("Loading IAT script...");

  // Return an init function that accepts configuration
  return {
    init: function (config) {
      console.log("Initializing IAT with config:", config);

      // Load the IAT5 extension and activatePIP
      require(['activatePIP', '/iat5.js'], function (activatePIP, iatExtension) {
        console.log("IAT5 extension loaded");

        // Call the IAT extension with the provided configuration
        var script = iatExtension({
          category1: config.category1,
          category2: config.category2,
          attribute2: config.attribute2,
          attribute1: config.attribute1,

          ////In each block, we can include a number of mini-blocks, to reduce repetition of same group/response.
          blockAttributes_nTrials: 1,
          blockSwitch_nMiniBlocks: 1,
          ////In each block, we can include a number of mini-blocks, to reduce repetition of same group/response.
          blockSwitch_nTrials: 1, //Default is 24, but the demo studies are using 40 currently.
          blockCategories_nTrials: 1,
          blockSwitch_nMiniBlocks: 1,
          blockCategories_nMiniBlocks: 1,

          fb_strong_Att1WithCatA_Att2WithCatB: 'Your data suggest strong automatic preference for categoryB over categoryA.',
          fb_moderate_Att1WithCatA_Att2WithCatB: 'Your data suggest moderate automatic preference for categoryB over categoryA.',
          fb_slight_Att1WithCatA_Att2WithCatB: 'Your data suggest weak automatic preference for categoryB over categoryA.',
          fb_equal_CatAvsCatB: 'Your data suggest no automatic preference between categoryA and categoryB.',
          leftKeyText: 'Appuyez sur "E" pour',
          rightKeyText: 'Appuyez sur "I" pour',
          fontColor: '#000000', //The default color used for printed messages.

          //Instructions text.
          instCategoriesPractice: config.steps?.step1,
          instAttributePractice: config.steps?.step2,
          instFirstCombined: config.steps?.stepFirstCombined,
          instSecondCombined: config.steps?.stepSecondCombined,
          instSwitchCategories: config.steps?.stepSwitchCategories,
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
        });

        console.log("IAT script created, activating PIPlayer...", script);

        // Activate PIPlayer with the script
        activatePIP(script);

        console.log("IAT initialized and playing");
      });
    }
  };
});


