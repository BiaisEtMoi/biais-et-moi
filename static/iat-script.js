define(['pipAPI', 'pipScorer', 'underscore'], function (APIConstructor, Scorer, _) {
  console.log("Loading IAT script...");

  // Load the IAT5 extension and activatePIP
  require(['activatePIP', '/iat5.js'], function (activatePIP, iatExtension) {
    console.log("IAT5 extension loaded");

    // Call the IAT extension with your configuration
    var script = iatExtension({
      category1: {
        name: 'Black People', //Will appear in the data.
        title: {
          media: { word: 'Black People' }, //Name of the category presented in the task.
          css: { color: '#31b404', 'font-size': '2em' }, //Style of the category title.
          height: 4 //Used to position the "Or" in the combined block.
        },
        stimulusMedia: [ //Stimuli content as PIP's media objects
          { image: 'bf14_nc.jpg' },
          { image: 'bf23_nc.jpg' },
          { image: 'bf56_nc.jpg' },
          { image: 'bm14_nc.jpg' },
          { image: 'bm23_nc.jpg' },
          { image: 'bm56_nc.jpg' }
        ],
        //Stimulus css (style)
        stimulusCss: { color: '#31b404', 'font-size': '1.8em' }
      },
      category2: {
        name: 'White People', //Will appear in the data.
        title: {
          media: { word: 'White People' }, //Name of the category presented in the task.
          css: { color: '#31b404', 'font-size': '2em' }, //Style of the category title.
          height: 4 //Used to position the "Or" in the combined block.
        },
        stimulusMedia: [ //Stimuli content as PIP's media objects
          { image: 'wf2_nc.jpg' },
          { image: 'wf3_nc.jpg' },
          { image: 'wf6_nc.jpg' },
          { image: 'wm1_nc.jpg' },
          { image: 'wm4_nc.jpg' },
          { image: 'wm6_nc.jpg' }
        ],
        //Stimulus css
        stimulusCss: { color: '#31b404', 'font-size': '1.8em' }
      },
      attribute2:
      {
        name: 'Good words',
        title: {
          media: { word: 'Good words' },
          css: { color: '#0000FF', 'font-size': '2em' },
          height: 4 //Used to position the "Or" in the combined block.
        },
        stimulusMedia: [ //Stimuli content as PIP's media objects
          { word: 'Laughter' },
          { word: 'Happy' },
          { word: 'Glorious' },
          { word: 'Joy' },
          { word: 'Wonderful' },
          { word: 'Peace' },
          { word: 'Pleasure' },
          { word: 'Love' }
        ],
        //Stimulus css
        stimulusCss: { color: '#0000FF', 'font-size': '1.8em' }
      },
      attribute1:
      {
        name: 'Bad words',
        title: {
          media: { word: 'Bad words' },
          css: { color: '#0000FF', 'font-size': '2em' },
          height: 4 //Used to position the "Or" in the combined block.
        },
        stimulusMedia: [ //Stimuli content as PIP's media objects
          { word: 'Awful' },
          { word: 'Failure' },
          { word: 'Agony' },
          { word: 'Hurt' },
          { word: 'Horrible' },
          { word: 'Terrible' },
          { word: 'Nasty' },
          { word: 'Evil' }
        ],
        //Stimulus css
        stimulusCss: { color: '#0000FF', 'font-size': '1.8em' }
      },

      ////In each block, we can include a number of mini-blocks, to reduce repetition of same group/response.
      blockSwitch_nTrials: 40, //Default is 24, but the demo studies are using 40 currently.
      blockSwitch_nMiniBlocks: 5,

      fb_strong_Att1WithCatA_Att2WithCatB: 'Your data suggest strong automatic preference for categoryB over categoryA.',
      fb_moderate_Att1WithCatA_Att2WithCatB: 'Your data suggest moderate automatic preference for categoryB over categoryA.',
      fb_slight_Att1WithCatA_Att2WithCatB: 'Your data suggest weak automatic preference for categoryB over categoryA.',
      fb_equal_CatAvsCatB: 'Your data suggest no automatic preference between categoryA and categoryB.',

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
});


