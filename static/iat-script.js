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
          blockSwitch_nTrials: 40, //Default is 24, but the demo studies are using 40 currently.
          blockSwitch_nMiniBlocks: 5,

          fb_strong_Att1WithCatA_Att2WithCatB: 'Your data suggest strong automatic preference for categoryB over categoryA.',
          fb_moderate_Att1WithCatA_Att2WithCatB: 'Your data suggest moderate automatic preference for categoryB over categoryA.',
          fb_slight_Att1WithCatA_Att2WithCatB: 'Your data suggest weak automatic preference for categoryB over categoryA.',
          fb_equal_CatAvsCatB: 'Your data suggest no automatic preference between categoryA and categoryB.',
          leftKeyText: 'Appuyez sur "E" pour',
          rightKeyText: 'Appuyez sur "I" pour',
          fontColor: '#000000', //The default color used for printed messages.

          //Instructions text.
          instAttributePractice: '<div><p align="center" style="font-size:20px; font-family:arial">' +
            '<font color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' +
            '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' +
            'Put a left finger on the <b>E</b> key for <font color="#0000ff">leftAttribute.</font>' +
            '<br/>Put a right finger on the <b>I</b> key for <font color="#0000ff">rightAttribute</font>.<br/><br/>' +
            'If you make a mistake, a red <font color="#ff0000"><b>X</b></font> will appear. ' +
            'Press the other key to continue. ' +
            '<u>Go as fast as you can</u> while being accurate.<br/><br/>' +
            '<p align="center">Press the <b>space bar</b> when you are ready to start.</font></p></div>',
          instCategoriesPractice: '<div><p align="center" style="font-size:20px; font-family:arial">' +
            '<font color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' +
            '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' +
            'Put a left finger on the <b>E</b> key for <font color="#31b404">leftCategory</font> images. ' +
            '<br/>Put a right finger on the <b>I</b> key for <font color="#31b404">rightCategory</font> images.<br/>' +
            'Items will appear one at a time.<br/><br/>' +
            'If you make a mistake, a red <font color="#ff0000"><b>X</b></font> will appear. ' +
            'Press the other key to continue. ' +
            '<u>Go as fast as you can</u> while being accurate.<br/><br/>' +
            '<p align="center">Press the <b>space bar</b> when you are ready to start.</font></p></div>',
          instFirstCombined: '<div><p align="center" style="font-size:20px; font-family:arial">' +
            '<font color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' +
            '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' +
            'Use the <b>E</b> key for <font color="#31b404">leftCategory</font> images and for <font color="#0000ff">leftAttribute</font><br/>' +
            'Use the <b>I</b> key for <font color="#31b404">rightCategory</font> images and <font color="#0000ff">rightAttribute</font><br/>' +
            'Each item belongs to only one category.<br/><br/>' +
            'If you make a mistake, a red <font color="#ff0000"><b>X</b></font> will appear. ' +
            'Press the other key to continue. <u>Go as fast as you can</u> while being accurate.<br/><br/>' +
            '<p align="center">Press the <b>space bar</b> when you are ready to start.</font></p></div>',
          instSecondCombined: '<div><p align="center" style="font-size:20px; font-family:arial">' +
            '<font color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' +
            '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' +
            'This is the same as the previous part.<br/>' +
            'Use the <b>E</b> key for <font color="#31b404">leftCategory</font> images and for <font color="#0000ff">leftAttribute</font><br/>' +
            'Use the <b>I</b> key for <font color="#31b404">rightCategory</font> images and <font color="#0000ff">rightAttribute</font><br/>' +
            'Each item belongs to only one category.<br/><br/>' +
            '<u>Go as fast as you can</u> while being accurate.<br/><br/>' +
            '<p align="center">Press the <b>space bar</b> when you are ready to start.</font></p></div>',
          instSwitchCategories: '<div><p align="center" style="font-size:20px; font-family:arial">' +
            '<font color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' +
            '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' +
            '<b>Watch out, the labels have changed position!</b><br/>' +
            'Use the left finger on the <b>E</b> key for <font color="#31b404">leftCategory</font>.<br/>' +
            'Use the right finger on the <b>I</b> key for <font color="#31b404">rightCategory</font>.<br/><br/>' +
            '<u>Go as fast as you can</u> while being accurate.<br/><br/>' +
            '<p align="center">Press the <b>space bar</b> when you are ready to start.</font></p></div>',

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
          }
        });

        console.log("IAT script created, activating PIPlayer...", script);

        // Activate PIPlayer with the script
        activatePIP(script);

        console.log("IAT initialized and playing");
      });
    }
  };
});


