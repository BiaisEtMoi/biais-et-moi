define('pipAPI',['require','underscore','jquery'],function(require){

	var _ = require('underscore');

	/**
	 * Constructor for PIPlayer script creator
	 * @return {Object}		Script creator
	 */
	function API(name){
		this.script = {
			global: {}, // the real global should be extended with this
			current: {}, // this is the actual namespace for this PIP
			trialSets: [],
			stimulusSets: [],
			mediaSets: [],
			sequence: []
		};

		this.script.name = name || 'anonymous PIP';

		this.settings = this.script.settings = {
			canvas: {
				maxWidth: 800,
				proportions: 0.8
			},
			hooks: {}
		};
	}

	_.extend(API.prototype, {

		// add set function
		addTrialSets: add_set('trial'),
		addStimulusSets: add_set('stimulus'),
		addMediaSets: add_set('media'),

		// settings
		addSettings: function(name, settingsObj){
			var settings;

			if (_.isPlainObject(settingsObj)){
				settings = this.settings[name] = this.settings[name] || {};
				_.extend(settings, settingsObj);
			} else {
				this.settings[name] = settingsObj;
			}

			return this;
		},

		addSequence: function(sequence){
			var script = this.script;
			_.isArray(sequence) || (sequence = [sequence]);

			script.sequence = script.sequence.concat(sequence);

			return this;
		},

		addGlobal: function(global){
			if (!_.isPlainObject(global)){
				throw new Error('global must be an object');
			}
			_.merge(this.getGlobal(), global);
		},

		getGlobal: function(){
			return window.piGlobal;
		},

		addCurrent: function(current){
			if (!_.isPlainObject(current)){
				throw new Error('current must be an object');
			}
			_.merge(this.script.current, current);
		},

		getCurrent: function(){
			return this.script.current;
		},

		// push a whole script
		addScript: function(obj){
			_.merge(this.script,obj);
		},

		// returns script (for debuging probably)
		getScript: function(){
			return this.script;
		},

		getLogs: function(){
			return this.script.current.logs;
		},

		// run the player, returns deferred
		play: function(){
			throw new Error('you should return API.script instead of calling API.play()!!');
		},

		post: function(url, obj){
			var $ = require('jquery');
			$.post(url, obj);
		}

	});

	return API;

	 /**
	  * Create a function that adds sets of a scpecific type
	  * @param {String} type  	The type of set setter to create
	  * @returns {Function} 	A setter object
	  */
	function add_set(type){

		/**
		 * Adds a set to the targetSet
		 * @param {String, Object} set    	Either full set object, or the name of this setArr
		 * @param {Array} setArr 			An array of objects for this set
		 * @returns {Object} The API object
		 *
		 * use examples:
		 * fn({
		 *   intro: [intro1, intro2],
		 *   Default: [defaultTrial]
		 * })
		 * fn('intro',[intro1, intro2])
		 * fn('Default',defaultTrial)
		 *
		 */
		function setSetter(set, setArr){

			// get the sets we want to extend (or create them)
			var targetSets = this.script[type + "Sets"] || (this.script[type + "Sets"] = []);
			var list;

			if (_.isPlainObject(set)) {
				list = _(set)
					// for each set of elements
					.map(function(value, key){
						// add the set name to each key
						_.each(value, function(v){v.set = key;});
						return value; // return the set
					})
					.flatten() // flatten all sets to a single array
					.value();
			}

			if (_.isArray(set)){
				list = set;
			}

			if (_.isString(set)){
				list = _.isArray(setArr) ? setArr : [setArr];
				list = _.map(list, function(value){
					value.set = set;
					return value;
				});

			}

			// merge the list into the targetSet
			targetSets.push.apply(targetSets, list);
		}

		return setSetter;
	}
});
/**
 * Essentialy a defaults object for the scorer
 */
define('pipScorer/computeD',['require','jquery'],function(require){
	var $ = require('jquery');

	function ComputeD(){
		$.extend(this, {
			dataArray : {}, //The data array or structure the PIP will provide
			AnalyzedVar : "latency", //The main variable used for the score computation. Usually will be the latency.
			ErrorVar : "error", //The variable that indicates whether there was an error in the response
			condVar:"",  //The name of the variable that will store the variables
			cond1VarValues: [], //An array with the values of the condVar that will comprise of condition 1 in the comparison
			cond2VarValues: [], //An array with the values of the condVar that will comprise of condition 2 in the comparison
			parcelVar : "",
			parcelValue : [],
			fastRT : 300, //Below this reaction time, the latency is considered extremely fast.
			maxFastTrialsRate : 0.1, //Above this % of extremely fast responses within a condition, the participant is considered too fast.
			minRT : 400, //Below this latency
			maxRT : 10000, //above this
			maxErrorParcelRate: 0.4,
			errorLatency : {use:"latency", penalty:600, useForSTD:true},
			postSettings : {}
		});
	}

	$.extend(ComputeD.prototype, {
		setComputeObject: function(obj){
			$.extend(this,obj);
		},

		setDataArray: function(){
			// use the real global in order to preven problems with dependencies
			var global = window.piGlobal;

			this.dataArray = global.current.logs;
		}

	});

	return ComputeD;
});
define('pipScorer/msgMan',['require','underscore'],function(require){
	var _ = require('underscore');

	var messages = {
		MessageDef:[],
		manyErrors: "There were too many errors made to determine a result.",
		tooFast: "There were too many fast trials to determine a result.",
		notEnough: "There were not enough trials to determine a result."
	};

	function Message(){
		// setup default local messages
		this.messages = _.extend({}, messages);
	}

	_.extend(Message.prototype, {

		/**
		 * Setup custom local messages
		 * @param {Object} Obj 	messages object
		 */
		setMsgObject: function(Obj){
			_.extend(this.messages,Obj);
		},

		getScoreMsg: function(score){

			var array = this.messages.MessageDef;

			if (!array || !array.length){
				throw new Error('You must define a "MessageDef" array.');
			}

			var scoreNum = parseFloat(score);
			var cut = null;
			var msg = null;
			var rightMsg = 'error: msg was not set';
			var set = false;

			// @TODO repleace this whole section with a "_.find()" or something.
			_.each(array, function(val) {
				cut = parseFloat(val.cut);
				msg = val.message;
				if (scoreNum<=cut && !set){
					rightMsg = msg;
					set = true;
				}
			});

			if (!set){
				var length = array.length;
				var obj = array[length-1];
				rightMsg = obj.message;
			}

			return rightMsg;
		},

		getMessage: function getMessage(type){
			return this.messages[type];
		}
	});

	return Message;
});
define('pipScorer/parcelMng',['require','underscore'],function(require){

	var _ = require('underscore');

	function ParcelMng(msgMan){
		this.parcelArray = []; // Holds parcel array
		this.scoreData = {}; // Holds score and error message
		this.msgMan = msgMan;
	}

	_.extend(ParcelMng.prototype, {

/*  Method: Void Init
	Input: Uses logs from API
	Output: Sets parcelArray with array of type parcel
	Description: Init goes over the log and creates an array of object of type Parcel according to
	the parcelValue array in computeD. Each parcel object holds relevant information regarding the
	parcel including an array of trials with the relevant parcel name.


*/
		Init: function(compute){
			var parcelMng = this;
			var msgMan = this.msgMan;
			// use the real global in order to prevent problems with dependencies
			var global = window.piGlobal;

			var data = global.current.logs;
			parcelMng.parcelArray = [];
			parcelMng.scoreData = {};
			parcelMng.msgMan = msgMan;

			// get settings
			var AnalyzedVar = compute.AnalyzedVar;
			var error = compute.ErrorVar;
			var parcelVar = compute.parcelVar;
			var parcels = compute.parcelValue;
			var min = compute.minRT;
			var max = compute.maxRT;
			var fastRT= compute.fastRT;

			// set counters
			var totalScoredTrials = 0;
			var trialsUnder = 0;
			var totalTrials=0;
			var totalErrorTrials =0;
			var maxFastTrialsRate = parseFloat(compute.maxFastTrialsRate);


			if (typeof parcels == 'undefined' || parcels.length === 0){
				totalTrials =0;
				totalScoredTrials=0;
				trialsUnder=0;
				totalErrorTrials=0;
				var p = {};
				p.name = 'general';
				p.trialIData = [];
				_.each (data, function (value) {// loop per object in logger
						if (value[AnalyzedVar]>=min && value[AnalyzedVar]<=max){
							totalTrials++;
							if (value.data[error] == 1) {
								totalErrorTrials++;
							}
							//p.trialIData.push(value);//push all data
							//totalScoredTrials++;
							if (parcelMng.validate(p,value,compute)) {
								totalScoredTrials++;
							}
						}else {
							if (value[AnalyzedVar]<= fastRT) {
								trialsUnder++;
							}
						}
				});
				parcelMng.checkErrors(totalTrials,totalErrorTrials,compute);
				parcelMng.parcelArray[0] = p;
			} else {
				_.each (parcels, function(parcelName,index) {// per parcel from parcelValue
					//set variables calculated per parcel
					totalTrials =0;
					totalScoredTrials=0;
					trialsUnder=0;
					totalErrorTrials=0;
					var p = {};
					p.name = parcelName;
					p.trialIData = [];
					///////////////////////////////////
					_.each (data, function (value) {//loop per object in logger
						var trialParcelName = value.data[parcelVar];

						// if this trial belongs to parcel
						if (trialParcelName == parcelName){
							if (value[AnalyzedVar]>=min && value[AnalyzedVar]<=max){
								totalTrials++;
								if (value.data[error] == 1) {
									totalErrorTrials++;
								}
								//p.trialIData.push(value);//push all data
								//totalScoredTrials++;
								if (parcelMng.validate(p,value,compute)) {
									totalScoredTrials++;
								}
							}else {
								if (value[AnalyzedVar]<= fastRT) {
									trialsUnder++;
								}
							}

						}

					});
					parcelMng.checkErrors(totalTrials,totalErrorTrials,compute);//apply maxErrorParcelRate logic
					parcelMng.parcelArray[index] = p;
				});
			}
			if ( (trialsUnder/totalScoredTrials) > maxFastTrialsRate){
				parcelMng.scoreData.errorMessage = this.msgMan.getMessage('tooFast');

			}

		},

/*
	private
	Method: Void checkErrors
	Input: totalTrials,totalErrorTrials and compute object.
	Output: Sets scoreData with error message if relevant.
	Description: Helper method to check for errors according to maxErrorParcelRate from compute object.
	sets an error message in scoreData.

*/
		checkErrors: function(totalTrials,totalErrorTrials,compute){

			var maxErrorParcelRate = compute.maxErrorParcelRate;
			if (totalErrorTrials/totalTrials > maxErrorParcelRate){
				this.scoreData.errorMessage = this.msgMan.getMessage('manyErrors');

			}

		},

/* Function: Void validate.
	Input: parcel object, trial object from the log and the compute object.
	Output: Pushes the trial to the parcel based on information from errorLatency. Returns true/false.
	Description: Helper method to apply errorLatency logic. If set to 'latency' trials witch are error
	would be added to the parcel trial array. if set to false trials that are error would not be added,
	if set to panelty error trials will be added and later panelized.

*/

		validate: function(p,value,compute){
			var errorLatency = compute.errorLatency;
			var error = compute.ErrorVar;
			var data = value.data;


			if (errorLatency.use =='latency'){
				p.trialIData.push(value);
				return true;
			}else{
				if (errorLatency.use =='false'){
					if(data[error]=='1'){
						return false;
					}else{
						p.trialIData.push(value);
						return true;
					}
				}
				if(errorLatency.use =='penalty'){
					p.trialIData.push(value);
					return true;
				}
			}
		},

/*  Function: Void addPenalty.
	Input: parcel object and the compute object.
	Output: adds penalty to latency of trials
	Description: Helper method to add average and penalty to error trials
	if errorLatency is set to 'penalty'. Should be called after avgAll.

*/

		addPenalty: function(p,compute){
			var errorLatency = compute.errorLatency;
			var parcelMng = this;


			if (errorLatency.use == 'penalty'){

				var penalty = parseFloat(errorLatency.penalty);
				var ErrorVar = compute.ErrorVar;
				var AnalyzedVar = compute.AnalyzedVar;
				var condVar = compute.condVar;
				var cond1 = compute.cond1VarValues;
				var cond2 = compute.cond2VarValues;
				var trialIData = p.trialIData;
				var avg1 = p.avgCon1;
				var avg2 = p.avgCon2;


				_.each (trialIData, function (value) {
					var data = value.data;
					var error = data[ErrorVar];
					var dataCond = data[condVar];
					var diff1 = parcelMng.checkArray(dataCond,cond1);
					var diff2 = parcelMng.checkArray(dataCond,cond2);

					if (error=='1'){
						if (diff1){
							value[AnalyzedVar] += avg1+ penalty;
						}else{
							if (diff2){
								value[AnalyzedVar] += avg2+ penalty;
							}
						}

					}
				});

			}
		},

/*  Function: Void avgAll.
	Input: compute object.
	Output: setting avgCon1 and avgCon2
	Description: Loop over the parcels and Set average for condition 1 trials and for condition 2 trials.

*/

		avgAll: function(compute){
			var parcelMng = this;
			_.each(parcelMng.parcelArray, function (value) {
				parcelMng.avgParcel(value,compute);
			});
		},


/*
	private
	Function: Void avgParcel.
	Input: compute object, parcel.
	Output: setting avgCon1 and avgCon2 in parcel.
	Description: Set average for condition 1 trials and for condition 2 trials in the parcel.

*/

		avgParcel: function(p,compute){
			var parcelMng = this;
			var trialIData = p.trialIData;
			var condVar = compute.condVar;
			var cond1 = compute.cond1VarValues;
			var cond2 = compute.cond2VarValues;
			var AnalyzedVar = compute.AnalyzedVar;
			var avgCon1 = 0;
			var avgCon2 = 0;
			var avgBoth = 0;
			var numCond1 = 0;
			var numCond2 = 0;
			var numBoth = 0;

			_.each (trialIData, function (value) {

				var AnVar = value[AnalyzedVar];
				var data = value.data;
				avgBoth += AnVar;
				numBoth ++;
				//var diff1 = ( _(data[condVar]).difference(cond1) );
				//var diff2 = ( _(data[condVar]).difference(cond2) );
				var dataCond = data[condVar];
				var diff1 = parcelMng.checkArray(dataCond,cond1);
				var diff2 = parcelMng.checkArray(dataCond,cond2);

				if (diff1) {
					numCond1++;
					avgCon1 += AnVar;
				} else {
					if (diff2){
						numCond2++;
						avgCon2 += AnVar;
					}
				}

			});
			if (numCond1 <= 2 || numCond2 <= 2){
				parcelMng.scoreData.errorMessage = this.msgMan.getMessage("notEnough");
			}
			if (numCond1 !== 0) {
				avgCon1 = avgCon1/numCond1;
			}
			if (numCond2 !== 0) {
				avgCon2 = avgCon2/numCond2;
			}
			p.avgCon1 = avgCon1;
			p.avgCon2 = avgCon2;
			p.diff = p.avgCon1 - p.avgCon2;
			if (numBoth !== 0) {
				p.avgBoth = avgBoth/numBoth;
			}
			parcelMng.addPenalty(p,compute);
		},

/*  Function: Void checkArray.
	Input: the condition from the trial and an array of condition from computeD object.
	Output: return true if condition is in the array.
	Description: Helper function that returns true if condition is in the array or false otherwise.

*/

		checkArray: function(conFromData,con){
			for(var i=0; i<con.length; i++){
				var condition = con[i];
				if (condition == conFromData ){
					return true;
				}
			}

			return false;
		},

/*  Function: Void varianceAll.
	Input: compute object, parcel.
	Output: variance variable in parcel.
	Description: Loop over the parcels and set the variance variable.

*/

		varianceAll: function(compute){
			var parcelMng = this;
			_.each (parcelMng.parcelArray, function (value) {
				parcelMng.varianceParcel(value,compute);
			});
		},

/*  Function: Void varianceParcel.
	Input: compute object, parcel.
	Output: setting variance variable in parcel.
	Description: goes over the trials of the parcel and calculate variance.

*/
		varianceParcel: function(p,compute){
			var parcelMng = this;
			var AnalyzedVar = compute.AnalyzedVar;
			var trialIData = p.trialIData;
			var cond1 = compute.cond1VarValues;
			var cond2 = compute.cond2VarValues;
			var condVar = compute.condVar;
			var avg = p.avgBoth;
			var d = 0;
			var x2 = 0;
			var pooledCond1 = [];
			var pooledCond2 = [];
			var pooledData = [];
			var errorLatency = compute.errorLatency;
			var useForSTD = errorLatency.useForSTD;


			_.each (trialIData, function (value) {//pool to one array
				var data = value.data;
				var AnVar = value[AnalyzedVar];
				var ErrorVar = compute.ErrorVar;
				var error = data[ErrorVar];
				var dataCond = data[condVar];
				var diff1 = parcelMng.checkArray(dataCond,cond1);
				var diff2 = parcelMng.checkArray(dataCond,cond2);
				//var diff1 = ( _(data[condVar]).difference(cond1) );
				//var diff2 = ( _(data[condVar]).difference(cond2) );
				if (diff1) {
					if (useForSTD){
						pooledCond1.push(AnVar);
					}
					else{
						if (error=='0') {
							pooledCond1.push(AnVar);
						}
					}
				}
				else {
					if (diff2){
						if (useForSTD){
							pooledCond2.push(AnVar);
						}
						else{
							if (error=='0') {
								pooledCond1.push(AnVar);
							}
						}

					}
				}


			});

			pooledData = pooledCond1.concat(pooledCond2);
			_.each (pooledData, function (value) {//pool to one array
				var AnVar = value;
				d = AnVar-avg;
				x2 += d*d;

			});
			p.variance = x2/(pooledData.length-1);
		},


/*  Function: Void scoreAll.
	Input: compute object.
	Output: score variable in scoreData object
	Description: Average the scores from all parcels set score in scoreData object.

*/
		scoreAll: function(compute){
			var parcelMng = this;
			var dAvg = 0;
			_.each (parcelMng.parcelArray, function (value) {
				parcelMng.scoreParcel(value,compute);
				dAvg +=  value.score;
			});
			var score = (dAvg/(parcelMng.parcelArray.length));
			parcelMng.scoreData.score = score.toFixed(2);

		},

/*
	private
	Function: Void scoreParcel.
	Input: compute object, parcel.
	Output: score variable in parcel
	Description: Calculate the score for the parcel.

*/
		scoreParcel: function(p){
			var parcelMng = this;
			var sd = Math.sqrt(p.variance);
			if (sd === 0){
				parcelMng.scoreData.errorMessage = this.msgMan.getMessage("notEnough");
				p.score = p.diff;
			} else {
				p.score = p.diff/sd;
			}
		}

	});

	return ParcelMng;
});
define('pipScorer/Scorer',['require','jquery','./computeD','./msgMan','./parcelMng'],function(require){

	var $ = require('jquery')
		, ComputeData = require('./computeD')
		, MsgMan = require('./msgMan')
		, ParcelMng = require('./parcelMng');

	// Description: make sure console.log is safe among all browsers.
	// js hint thinks that console is read only - and its correct except where it doesn't exist...  this is how we tell it to ignore these lines
	/* jshint -W020 */
	!!window.console || (console = {log: $.noop, error: $.noop});
	console.log || (console.log = $.noop);
	/* jshint +W020 */



	function Scorer(){
		this.computeData = new ComputeData();
		this.msgMan = new MsgMan();
		this.parcelMng = new ParcelMng(this.msgMan);
	}

	$.extend(Scorer.prototype, {

		/**
		 * Set settings for computeD or msgMan
		 * @param {String} type 'compute' or 'message' - the type of settingsObj to set
		 * @param {Object} Obj  The settings object itself
		 */
		addSettings: function(type,Obj){
			switch (type){
				case 'compute':
					this.computeData.setComputeObject(Obj);
					break;
				case 'message':
					this.msgMan.setMsgObject(Obj);
					break;
				default:
					throw new Error('SCORER:addSettings: unknow "type" ' + type);
			}
		},

		/**
		 * Calculate the score
		 * @return {Object} an object that holds the score and an error message
		 */
		computeD: function(){
			var computeData = this.computeData;
			var parcelMng = this.parcelMng;

			computeData.setDataArray();

			parcelMng.Init(computeData);
			parcelMng.avgAll(computeData);

			parcelMng.varianceAll(computeData);
			parcelMng.scoreAll(computeData);

			var scoreObj = parcelMng.scoreData;

			if (scoreObj.errorMessage === undefined || scoreObj.errorMessage === null){
				return {
					FBMsg : this.getFBMsg(scoreObj.score),
					DScore : scoreObj.score,
					error: false
				};
			}else{
				return {
					FBMsg : scoreObj.errorMessage,
					DScore : '',
					error: true
				};
			}
		},

		/**
		 * Post the score and message to the server
		 * @param  {[type]} score    [description]
		 * @param  {[type]} msg      [description]
		 * @param  {String} scoreKey The key with which to send the score data
		 * @param  {String} msgKey   The key with which to send the msg data
		 * @return {promise}         A promise that is resolved with the post
		 */
		postToServer: function(score,msg,scoreKey,msgKey){
			var postSettings = this.computeData.postSettings || {};
			var url = postSettings.url;
			var data = {};

			if (!scoreKey) {
				scoreKey = postSettings.score;
			}

			if (!msgKey) {
				msgKey = postSettings.msg;
			}

			// create post object
			data[scoreKey] = score;
			data[msgKey] = msg;

			return $.post(url,JSON.stringify(data));
		},

		/**
		 * Blindly post all "data" to the server
		 * @param  {Object} data Arbitrary data to be sent to the server
		 * @return {promise}      A promise that is resolved with the post
		 */
		dynamicPost: function(data){
			var postSettings = this.computeData.postSettings || {};
			var url = postSettings.url;

			return $.post(url,JSON.stringify(data));
		},

		// get message according to user input
		getFBMsg: function(DScore){
			var msg = this.msgMan.getScoreMsg(DScore);
			return msg;
		}

	});
	return Scorer;
});
define('pipScorer', ['pipScorer/Scorer'], function (main) { return main; });

define('iatScript',['pipAPI', 'pipScorer', 'underscore'], function (APIConstructor, Scorer, _) {
  console.log("Loading IAT script...");

  // Return an init function that accepts configuration
  return {
    init: function (config) {
      console.log("Initializing IAT with config:", config);

      // Load the IAT5 extension and activatePIP
      require(['activatePIP', 'iat5'], function (activatePIP, iatExtension) {
        console.log("IAT5 extension loaded");

        // Call the IAT extension with the provided configuration
        var script = iatExtension({
          category1: config.category1,
          category2: config.category2,
          attribute2: config.attribute2,
          attribute1: config.attribute1,

          // blockAttributes_nTrials: 1,
          // blockAttributes_nMiniBlocks: 1,
          // blockCategories_nTrials: 1,
          // blockCategories_nMiniBlocks: 1,
          // blockFirstCombined_nTrials: 1,
          // blockFirstCombined_nMiniBlocks: 1,
          // blockSecondCombined_nTrials: 1, //Not used if nBlocks=5.
          // blockSecondCombined_nMiniBlocks: 1, //Not used if nBlocks=5.
          // blockSwitch_nTrials: 1,
          // blockSwitch_nMiniBlocks: 1,

          fb_strong_Att1WithCatA_Att2WithCatB: 'Vos données suggèrent une forte préférence automatique pour categoryB plutôt que categoryA.',
          fb_moderate_Att1WithCatA_Att2WithCatB: 'Vos données suggèrent une préférence automatique modérée pour categoryB plutôt que categoryA.',
          fb_slight_Att1WithCatA_Att2WithCatB: 'Vos données suggèrent une faible préférence automatique pour categoryB plutôt que categoryA.',
          fb_equal_CatAvsCatB: 'Vos données ne suggèrent aucune préférence automatique entre categoryA et categoryB.',

          leftKeyText: 'Appuyez sur "E" pour',
          rightKeyText: 'Appuyez sur "I" pour',
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
        });

        console.log("IAT script created, activating PIPlayer...", script);

        // Activate PIPlayer with the script
        activatePIP(script);

        console.log("IAT initialized and playing");
      });
    }
  };
});



/*
 * this file holds the script we are to run
 */

define('app/task/script',[],function(){
	var scriptObj = {};

	/**
	 * Getter/Setter fo script
	 *
	 * @param  {Object || null} obj 	The new script, if it is not set this is simply a getter.
	 * @return {Object}     			The full script
	 */
	function script(obj){
		obj && (scriptObj = obj);
		return scriptObj;
	}

	return script;
});
/*
 * simply take settings out of the script
 */
define('app/task/settings',['require','./script'],function(require){

	var script = require('./script');

	/**
	 * get settings from script
	 * @param  {String} name  		Optional name of specific setting to get
	 * @return {*}         			The settings object (or a sub of it)
	 */
	function settingsGetter(name){
		var settings = script().settings || {};

		if (name) {
			return settings[name];
		}
		return settings;
	}

	return settingsGetter;
});
define('app/trial/current_trial',[],function(){
	/*
	 * holds a "global" instance of the current trial so we don't have to pass it on blindly.
	 *
	 * returns a function that return trial.
	 * if it gets input, it replaces the current trial with the input;
	 */

	var trial;

	return function(newTrial){
		if (newTrial) {
			trial = newTrial;
		}

		return trial;
	};
});
/*
 * adjust canvas according to window size and settings
 * this module is built to be part of the main view
 */
define('app/task/adjust_canvas',['require','jquery','app/task/settings','app/trial/current_trial'],function(require){

	var $ = require('jquery')
		, settingsGetter = require('app/task/settings')
		, trial = require('app/trial/current_trial');

	// the function to be used by the main view
	function adjust_canvas(init){
		var self = this;
		// get canvas settings
		var settings = settingsGetter('canvas') || {};

		// calculate proportions (as height/width)
		var proportions;
		if (settings.proportions) {
			if ($.isPlainObject(settings.proportions)) {
				if (typeof settings.proportions.height !== 'number' || typeof settings.proportions.width !== 'number'){
					throw new Error('The canvas proportions object`s height and a width properties must be numeric');
				}
				proportions = settings.proportions.height/settings.proportions.width; // if proportions are an object they should include width and height
			} else {
				proportions = settings.proportions || 0.8; // by default proportions are 0.8
			}
		}

		// we put this in a time out because of a latency of orientation change on android devices
		setTimeout(resize,init ? 0 : 500); // end timeout

		function resize(){
			var height, width;
			var $canvas = self.$el;

			// static canvas size
			if (settings.width){
				// if this is not init, we've already set screen size, so don't mess around
				if (!init){
					return true;
				}

				width = settings.width;
				height = width*proportions;

			} else { // dynamic canvas size
				// get current screen size
				var screenSize = {
					width: $(window).innerWidth(),
					height: $(window).innerHeight()
				};

				var maxHeight = screenSize.height;
				var maxWidth = Math.min(settings.maxWidth, screenSize.width, $canvas.parent().innerWidth());

				// calculate the correct size for this screen size
				if (maxHeight > proportions * maxWidth) {
					height = maxWidth*proportions;
					width = maxWidth;
				} else {
					height = maxHeight;
					width = maxHeight/proportions;
				}
			}

			// remove border width and top margin from calculated width (can't depend on cool box styles yet...)
			// we compute only margin-top because of a difference calculating margins between chrome + IE and firefox + mobile
			height -= parseInt($canvas.css('border-top-width'),10) + parseInt($canvas.css('border-bottom-width'),10) + parseInt($canvas.css('margin-top'),10);
			width -= parseInt($canvas.css('border-left-width'),10) + parseInt($canvas.css('border-right-width'),10);

			// reset canvas size
			$canvas.width(width);
			$canvas.height(height);
			$canvas.css('font-size',height*(settings.textSize || 3)/100);

			// refresh all stimuli (we don't want to do this before we have trials)
			if (trial()) {
				trial()._layout_collection.refresh();
				trial()._stimulus_collection.refresh();
			}

			// scroll to top of window (hides some of the mess on the top of mobile devices)
			window.scrollTo(0, 1);
		}
	}

	return adjust_canvas;
});
/**
 *
 * This whole module taken from piManager
 *
 */
define('app/task/canvasConstructor',['require','underscore'],function(require){

	var _ = require('underscore');

	/**
	 * Takes a map of css rules and applies them.
	 * Returns a function that returns the page to its former condition.
	 *
	 * The rule map is an object of ruleName -> ruleObject.
	 *
	 * var ruleObject = {
	 * 	element : wrapped element to affect
	 * 	property: css property to modify
	 * }
	 *
	 * @param  {Object} map      A hash of rules.
	 * @param  {Object} settings A hash of ruleName -> value
	 * @return {Function}        A function that undoes all the previous changes
	 */
	function canvasContructor(map, settings){
		var offArr;

		if (!_.isPlainObject(map)){
			throw new Error('canvas(map): You must set a rule map for canvas to work properly');
		}

		// if settings is undefined return a function that doesn't do anything
		// just so we don't need to make sure that the user modifies the canvas
		if (_.isUndefined(settings)){
			return _.noop;
		}

		if (!_.isPlainObject(settings)){
			throw new Error('canvas(settings): canvas settings must be an object');
		}

		// create an array of off functions to undo any changes by this action
		offArr = _.map(settings, function(value,key){
			var rule = map[key];
			if (rule){
				return on(rule.element, rule.property, value);
			} else {
				throw new Error('canvas('+ key +'): unknow key in canvas object.');
			}
		});

		return function off(){
			_.forEach(offArr, function(fn){fn.call();});
		};
	}

	function on($el, property, value){
		var old = $el.css(property); // save old value
		$el.css(property, value); // set new value
		return _.bind($el.css, $el, property, old); // create off function: bind $el.css(property, old)
	}

	return canvasContructor;

});
define('text',{load: function(id){throw new Error("Dynamic load not allowed: " + id);}});

define('text!templates/loading.html',[],function () { return '<style>\n/**\n * Loading page progress bars\n * http://css-tricks.com/css3-progress-bars/\n */\n \t.meter-wrapper{\n \t\tposition: relative;\n\t\ttop:50%;\n \t}\n\n\t.meter {\n\t\theight: 30px;  /* Can be anything */\n\t\tposition: relative;\n\t\tmargin-left: auto; margin-right: auto;\n\t\tmargin-top:-15px;\n\t\twidth:82%;\n\t\tbackground: #555;\n\t\t-moz-border-radius: 25px;\n\t\t-webkit-border-radius: 25px;\n\t\tborder-radius: 25px;\n\t\tpadding: 10px;\n\t\t-webkit-box-shadow: inset 0 -1px 1px rgba(255,255,255,0.3);\n\t\t-moz-box-shadow   : inset 0 -1px 1px rgba(255,255,255,0.3);\n\t\tbox-shadow        : inset 0 -1px 1px rgba(255,255,255,0.3);\n\t}\n\t.meter > span {\n\t\tdisplay: block;\n\t\theight: 100%;\n\t\t   -webkit-border-top-right-radius: 8px;\n\t\t-webkit-border-bottom-right-radius: 8px;\n\t\t\t   -moz-border-radius-topright: 8px;\n\t\t\t-moz-border-radius-bottomright: 8px;\n\t\t\t\t   border-top-right-radius: 8px;\n\t\t\t\tborder-bottom-right-radius: 8px;\n\t\t\t-webkit-border-top-left-radius: 20px;\n\t\t -webkit-border-bottom-left-radius: 20px;\n\t\t\t\t-moz-border-radius-topleft: 20px;\n\t\t\t -moz-border-radius-bottomleft: 20px;\n\t\t\t\t\tborder-top-left-radius: 20px;\n\t\t\t\t border-bottom-left-radius: 20px;\n\t\tbackground-color: rgb(43,194,83);\n\t\tbackground-image: -webkit-gradient(\n\t\t  linear,\n\t\t  left bottom,\n\t\t  left top,\n\t\t  color-stop(0, rgb(43,194,83)),\n\t\t  color-stop(1, rgb(84,240,84))\n\t\t );\n\t\tbackground-image: -moz-linear-gradient(\n\t\t  center bottom,\n\t\t  rgb(43,194,83) 37%,\n\t\t  rgb(84,240,84) 69%\n\t\t );\n\t\t-webkit-box-shadow:\n\t\t  inset 0 2px 9px  rgba(255,255,255,0.3),\n\t\t  inset 0 -2px 6px rgba(0,0,0,0.4);\n\t\t-moz-box-shadow:\n\t\t  inset 0 2px 9px  rgba(255,255,255,0.3),\n\t\t  inset 0 -2px 6px rgba(0,0,0,0.4);\n\t\tbox-shadow:\n\t\t  inset 0 2px 9px  rgba(255,255,255,0.3),\n\t\t  inset 0 -2px 6px rgba(0,0,0,0.4);\n\t\tposition: relative;\n\t\toverflow: hidden;\n\t}\n\t.meter > span:after, .animate > span > span {\n\t\tcontent: "";\n\t\tposition: absolute;\n\t\ttop: 0; left: 0; bottom: 0; right: 0;\n\t\tbackground-image:\n\t\t   -webkit-gradient(linear, 0 0, 100% 100%,\n\t\t\t  color-stop(.25, rgba(255, 255, 255, .2)),\n\t\t\t  color-stop(.25, transparent), color-stop(.5, transparent),\n\t\t\t  color-stop(.5, rgba(255, 255, 255, .2)),\n\t\t\t  color-stop(.75, rgba(255, 255, 255, .2)),\n\t\t\t  color-stop(.75, transparent), to(transparent)\n\t\t   );\n\t\tbackground-image:\n\t\t\t-moz-linear-gradient(\n\t\t\t  -45deg,\n\t\t\t  rgba(255, 255, 255, .2) 25%,\n\t\t\t  transparent 25%,\n\t\t\t  transparent 50%,\n\t\t\t  rgba(255, 255, 255, .2) 50%,\n\t\t\t  rgba(255, 255, 255, .2) 75%,\n\t\t\t  transparent 75%,\n\t\t\t  transparent\n\t\t   );\n\t\tz-index: 1;\n\t\t-webkit-background-size: 50px 50px;\n\t\t-moz-background-size: 50px 50px;\n\t\t-webkit-animation: move 2s linear infinite;\n\t\t   -webkit-border-top-right-radius: 8px;\n\t\t-webkit-border-bottom-right-radius: 8px;\n\t\t\t   -moz-border-radius-topright: 8px;\n\t\t\t-moz-border-radius-bottomright: 8px;\n\t\t\t\t   border-top-right-radius: 8px;\n\t\t\t\tborder-bottom-right-radius: 8px;\n\t\t\t-webkit-border-top-left-radius: 20px;\n\t\t -webkit-border-bottom-left-radius: 20px;\n\t\t\t\t-moz-border-radius-topleft: 20px;\n\t\t\t -moz-border-radius-bottomleft: 20px;\n\t\t\t\t\tborder-top-left-radius: 20px;\n\t\t\t\t border-bottom-left-radius: 20px;\n\t\toverflow: hidden;\n\t}\n\n\t.animate > span:after {\n\t\tdisplay: none;\n\t}\n\n\t@-webkit-keyframes move {\n\t\t0% {\n\t\t   background-position: 0 0;\n\t\t}\n\t\t100% {\n\t\t   background-position: 50px 50px;\n\t\t}\n\t}\n\n\t.orange > span {\n\t\tbackground-color: #f1a165;\n\t\tbackground-image: -moz-linear-gradient(top, #f1a165, #f36d0a);\n\t\tbackground-image: -webkit-gradient(linear,left top,left bottom,color-stop(0, #f1a165),color-stop(1, #f36d0a));\n\t\tbackground-image: -webkit-linear-gradient(#f1a165, #f36d0a);\n\t}\n\n\t.red > span {\n\t\tbackground-color: #f0a3a3;\n\t\tbackground-image: -moz-linear-gradient(top, #f0a3a3, #f42323);\n\t\tbackground-image: -webkit-gradient(linear,left top,left bottom,color-stop(0, #f0a3a3),color-stop(1, #f42323));\n\t\tbackground-image: -webkit-linear-gradient(#f0a3a3, #f42323);\n\t}\n\n\t.nostripes > span > span, .nostripes > span:after {\n\t\t-webkit-animation: none;\n\t\tbackground-image: none;\n\t}\n</style>\n\n<div class="meter-wrapper">\n\t<div class="meter">\n\t\t<span style="width: 0%"></span>\n\t</div>\n</div>';});

/*
 * The main view, responsible for managing the canvas
 */
define('app/task/main_view',['require','backbone','jquery','underscore','./adjust_canvas','./canvasConstructor','app/task/script','text!templates/loading.html'],function(require){

	var Backbone = require('backbone')
		, $ = require('jquery')
		, _ = require('underscore')
		, adjust_canvas = require('./adjust_canvas')
		, canvas = require('./canvasConstructor')
		,script = require('app/task/script')
		,loadingTpl = require('text!templates/loading.html');


	var View = Backbone.View.extend({

		id: 'canvas',

		initialize: function(){
			_.bindAll(this, ['activate','render','destroy']);

			this.deferred = $.Deferred();
			this.deferred.promise().always(this.destroy);

			/**
			 * Adjust canvas listener
			 * @type {[type]}
			 */
			var adjust = _.bind(this.adjustCanvas,this);
			$(window).on('orientationchange.pip resize.pip', adjust);
			this.deferred.promise().always(function(){
				$(window).off('orientationchange.pip resize.pip', adjust);
			});
		},

		render: function(){
			this.adjustCanvas(true);
			return this;
		},

		activate: function(){
			var self = this;
			var canvasSettings = script().settings.canvas || {};
			var docReady = $.Deferred(); // document ready deferred, so we can continue only after activation has culminated

			$(document).ready(function(){

				var map = {
					background 			: {element: $('body'), property: 'backgroundColor'},
					canvasBackground	: {element: self.$el, property:'backgroundColor'},
					borderColor			: {element: self.$el, property:'borderColor'},
					borderWidth			: {element: self.$el, property:'borderWidth'}
				};

				// settings activator
				var off = canvas(map, _.pick(canvasSettings,['background','canvasBackground','borderColor','borderWidth']));
				self.deferred.promise().always(off);

				canvasSettings.css && self.$el.css(canvasSettings.css);

				// append to body and render
				if ($('[pi-player]').length){
					$('[pi-player]').empty().append(self.$el);
				} else {
					self.$el.appendTo('body');
				}

				self.render();
				docReady.resolve();
			});

			return docReady;
		},

		// display loading page
		loading: function(parseDef){
			var $bar;

			// if loading has already finished lets skip the loading page
			if (parseDef.state() != "pending"){
				return parseDef;
			}

			// display the loading template
			this.$el.html(loadingTpl);

			$bar = this.$('.meter span');

			return parseDef
				.progress(function(done, remaining){
					// update progress bar
					$bar.width((remaining ? (done/remaining)*100 : 0) + '%');
				});
		},

		empty: function(){
			this.$el.empty();
		},

		destroy: function(){
			$(window).off('.pip');
			this.remove();
			this.unbind();
		},

		// sets canvas size (used also for refreshing upon orientation change)
		adjustCanvas: adjust_canvas
	});

	// Returns the View class
	return new View();
});
define('utils/database/mixer/mixer',['underscore'],function(_){

	/**
	 * A function that maps a mixer object into a sequence.
	 *
	 * The basic structure of such an obect is:
	 * {
	 *		mixer: 'functionType',
	 *		remix : false,
	 *		data: [task1, task2]
	 *	}
	 *
	 * The results of the mix are set into `$parsed` within the original mixer object.
	 * if remix is true $parsed is returned instead of recomputing
	 *
	 * @param {Object} [obj] [a mixer object]
	 * @returns {Array} [An array of mixed objects]
	 */

	mixProvider.$inject = ['randomizeShuffle', 'randomizeRandom'];
	function mixProvider(shuffle, random){

		function mix(obj){
			var mixerName = obj.mixer;

			// if this isn't a mixer
			// make sure we catch mixers that are set with undefined by accident...
			if (!(_.isPlainObject(obj) && 'mixer' in obj)){
				return [obj];
			}

			if (_.isUndefined(mix.mixers[mixerName])){
				throw new Error('Mixer: unknow mixer type = ' + mixerName);
			}

			if (!obj.remix && obj.$parsed) {
				return obj.$parsed;
			}

			obj.$parsed = mix.mixers[mixerName].apply(null, arguments);

			return obj.$parsed;
		}

		mix.mixers = {
			wrapper : function(obj){
				return obj.data;
			},

			repeat: function(obj){
					var sequence = obj.data || [];
					var result = [], i;
					for (i=0; i < obj.times; i++){
						result = result.concat(_.clone(sequence,true));
					}
					return result;
			},

			// randomize any elements
			random: function(obj, context){

				function randomDeepMixer(sequence){
					return _.reduce(sequence, function(arr,value){
						if (_.isPlainObject(value) && 'mixer' in value && value.mixer != 'wrapper'){
							var seq = mix(value, context);
							return arr.concat(seq);
						} else {
							return arr.concat([value]);
						}
					}, []);
				}

				var sequence = obj.data || [];
				return shuffle(randomDeepMixer(sequence));
			},

			choose: function(obj){
				var sequence = obj.data || [];
				return _.take(shuffle(sequence), obj.n ? obj.n : 1);
			},

			weightedRandom: function(obj){
				var sequence = obj.data || [];
				var i;
				var total_weight = _.reduce(obj.weights,function (prev, cur) {
					return prev + cur;
				});

				var random_num = random() * total_weight; // cutoff - when we reach this sum - we've reached the desired weight
				var weight_sum = 0;

				for (i = 0; i < sequence.length; i++) {
					weight_sum += obj.weights[i];
					weight_sum = +weight_sum.toFixed(3);

					if (random_num <= weight_sum) {
						return [obj.data[i]];
					}
				}
				throw new Error('Mixer: something went wrong with weightedRandom');
			}
		};

		return mix;
	}

	return mixProvider;
});
define('utils/database/mixer/branching/dotNotation',['require','underscore'],function(require){
	var _ = require('underscore');

	function dotNotation(chain, obj){

		if (_.isString(chain)){
			chain = chain.split('.');
		}

		return _.reduce(chain, function(result, link){

			if (_.isPlainObject(result) || _.isArray(result)){
				return result[link];
			}

			return undefined;

		}, obj);
	}

	return dotNotation;
});
define('utils/database/mixer/branching/mixerDotNotationProvider',['require','underscore'],function(require){
	var _ = require('underscore');

	mixerDotNotationProvider.$inject = ['dotNotation'];
	function mixerDotNotationProvider(dotNotation){

		function mixerDotNotation(chain, obj){

			var escapeSeparatorRegex= /[^\/]\./;

			if (!_.isString(chain)){
				return chain;
			}

			// We do not have a non escaped dot: we treat this as a string
			if (!escapeSeparatorRegex.test(chain)){
				return chain.replace('/.','.');
			}

			return dotNotation(chain, obj);
		}

		return mixerDotNotation;
	}

	return mixerDotNotationProvider;

});
define('utils/database/mixer/branching/mixerConditionProvider',['require','underscore'],function(require){
	var _ = require('underscore');

	mixerConditionProvider.$inject = ['mixerDotNotation', 'piConsole'];
	function mixerConditionProvider(dotNotation, piConsole){

		function mixerCondition(condition, context){
			var left, right, operator;

			// support a condition that is a plain function
			if (_.isFunction(condition)){
				operator = condition;
			} else {
				// @TODO angular.$parse may be a better candidate for doing this...
				left = dotNotation(condition.compare,context);
				right = dotNotation(condition.to,context);
				operator = condition.operator;
			}

			piConsole(['conditions']).info('Condition: ', left, operator || 'equals', right, condition);

			if (_.isFunction(operator)){
				return !! operator.apply(context,[left, right, context]);
			}

			switch(operator){
				case 'greaterThan':
					if (_.isNumber(left) && _.isNumber(right)){
						return +left > +right;
					}
					return false;

				case 'greaterThanOrEqual':
					if (_.isNumber(left) && _.isNumber(right)){
						return +left >= +right;
					}
					return false;

				case 'in':
					if (_.isArray(right)){
						// binary operator to turn indexOf into binary.
						return ~_.indexOf(right, left);
					}
					return false;

				case 'exactly':
					return left === right;

				case 'equals':
					/* falls through */
				default:
					if (_.isUndefined(right)){
						return !!left;
					}
					return _.isEqual(left, right);
			}

			return operator;
		}

		return mixerCondition;
	}

	return mixerConditionProvider;
});
define('utils/database/mixer/branching/mixerEvaluateProvider',['require','underscore'],function(require){
	var _ = require('underscore');

	evaluateProvider.$inject = ['mixerCondition'];
	function evaluateProvider(condition){
		/**
		 * Checks if a conditions set is true
		 * @param  {Array} conditions [an array of conditions]
		 * @param  {Object} context   [A context for the condition checker]
		 * @return {Boolean}          [Are these conditions true]
		 */

		function evaluate(conditions,context){
			// make && the default
			_.isArray(conditions) && (conditions = {and:conditions});

			function test(cond){return evaluate(cond,context);}

			// && objects
			if (conditions.and){
				return _.every(conditions.and, test);
			}
			if (conditions.nand){
				return !_.every(conditions.nand, test);
			}

			// || objects
			if (conditions.or){
				return _.some(conditions.or, test);
			}
			if (conditions.nor){
				return !_.some(conditions.nor, test);
			}

			return condition(conditions, context);
		}

		return evaluate;
	}

	return evaluateProvider;
});
/**
 * Registers the branching mixers with the mixer
 * @return {function}         [mixer decorator]
 */
define('utils/database/mixer/branching/mixerBranchingDecorator',['require','underscore'],function(require){

	var _ = require('underscore');

	mixerBranchingDecorator.$inject = ['$delegate','mixerEvaluate','mixerDefaultContext'];
	function mixerBranchingDecorator(mix, evaluate, mixerDefaultContext){

		mix.mixers.branch = branch;
		mix.mixers.multiBranch = multiBranch;

		return mix;

		/**
		 * Branching mixer
		 * @return {Array}         [A data array with objects to continue with]
		 */
		function branch(obj, context){
			context = _.extend(context || {}, mixerDefaultContext);
			return evaluate(obj.conditions, context) ? obj.data || [] : obj.elseData || [];
		}

		/**
		 * multiBranch mixer
		 * @return {Array}         [A data array with objects to continue with]
		 */
		function multiBranch(obj, context){
			context = _.extend(context || {}, mixerDefaultContext);
			var row;

			row = _.find(obj.branches, function(branch){
				return evaluate(branch.conditions, context);
			});

			if (row) {
				return row.data || [];
			}

			return obj.elseData || [];
		}
	}

	return mixerBranchingDecorator;
});
define('utils/database/mixer/mixerSequenceProvider',['require','underscore'],function(require){
	var _ = require('underscore');

	mixerSequenceProvider.$inject = ['mixer'];
	function mixerSequenceProvider(mix){

		/**
		 * MixerSequence takes an mixer array and allows browsing back and forth within it
		 * @param {Array} arr [a mixer array]
		 */
		function MixerSequence(arr){
			this.sequence = arr;
			this.stack = [];
			this.add(arr);
			this.pointer = 0;
		}

		_.extend(MixerSequence.prototype, {
			/**
			 * Add sequence to mixer
			 * @param {[type]} arr     Sequence
			 * @param {[type]} reverse Whether to start from begining or end
			 */
			add: function(arr, reverse){
				this.stack.push({pointer:reverse ? arr.length : -1,sequence:arr});
			},

			proceed: function(direction, context){
				// get last subSequence
				var subSequence = this.stack[this.stack.length-1];
				var isNext = (direction === 'next');

				// if we ran out of sequence
				// add the original sequence back in
				if (!subSequence) {
					throw new Error ('mixerSequence: subSequence not found');
				}

				subSequence.pointer += isNext ? 1 : -1;

				var el = subSequence.sequence[subSequence.pointer];

				// if we ran out of elements, go to previous level (unless we are on the root sequence)
				if (_.isUndefined(el) && this.stack.length > 1){
					this.stack.pop();
					return this.proceed.call(this,direction,context);
				}

				// if element is a mixer, mix it
				if (el && el.mixer){
					this.add(mix(el,context), !isNext);
					return this.proceed.call(this,direction,context);
				}

				// regular element or undefined (end of sequence)
				return this;
			},

			next: function(context){
				this.pointer++;
				return this.proceed.call(this, 'next',context);
			},

			prev: function(context){
				this.pointer--;
				return this.proceed.call(this, 'prev',context);
			},

			/**
			 * Return current element
			 * should **never** return a mixer - supposed to abstract them away
			 * @return {[type]} undefined or element
			 */
			current:function(){
				// get last subSequence
				var subSequence = this.stack[this.stack.length-1];

				if (!subSequence) {
					throw new Error ('mixerSequence: subSequence not found');
				}

				var el = subSequence.sequence[subSequence.pointer];

				if (!el){
					return undefined;
				}

				// extend element with meta data
				el.$meta = this.meta();

				return el;
			},

			meta: function(){
				return {
					number: this.pointer,

					// sum of sequence length, minus one (the mixer) for each level of stack except the last
					outOf:  _.reduce(this.stack, function(memo,sub){return memo + sub.sequence.length-1;},0)+1
				};
			}

		});

		return MixerSequence;
	}

	return mixerSequenceProvider;
});






define('utils/database/mixer/main',['require','underscore','./mixer','./branching/dotNotation','./branching/mixerDotNotationProvider','./branching/mixerConditionProvider','./branching/mixerEvaluateProvider','./branching/mixerBranchingDecorator','./mixerSequenceProvider'],function(require){
	var _ = require('underscore');

	var mixer = require('./mixer')(
		_.shuffle, // randomizeShuffle
		Math.random // randomizeRandom
	);

	var dotNotation = require('./branching/dotNotation'); // this is a value, doesn't need to be evaluated

	var mixerDotNotation = require('./branching/mixerDotNotationProvider')(dotNotation);
	var mixerCondition = require('./branching/mixerConditionProvider')(
		mixerDotNotation,
		piConsole
	);

	var mixerEvaluate = require('./branching/mixerEvaluateProvider')(mixerCondition);

	var mixerDefaultContext = {};

	require('./branching/mixerBranchingDecorator')(
		mixer,
		mixerEvaluate,
		mixerDefaultContext
	);

	var MixerSequence = require('./mixerSequenceProvider')(mixer);

	return MixerSequence;

	function piConsole(){
		return console;
	}

});
define('utils/database/template/templateObjProvider',['require','underscore'],function(require){
	var _ = require('underscore');

	templateObjProvider.$inject = ['$filter'];
	function templateObjProvider($filter){
		var filter = $filter('template');

		function templateObj(obj, context, options){
			options || (options = {});
			var result = {};
			var skip = options.skip || [];

			_.forEach(obj, function(value,key,obj){
				if (!_.includes(skip, key)){
					result[key] = expand(value, context);
				} else {
					result[key] = obj[key];
				}
			});

			return result;
		}

		return templateObj;

		function expand(value, context){

			if (_.isString(value)){
				return filter(value, context);
			}

			if (_.isArray(value)){
				return _.map(value, _.bind(expand, null, _, context));
			}

			if (_.isPlainObject(value)){
				return _.mapValues(value, _.bind(expand, null, _, context));
			}

			return value;
		}

	}


	return templateObjProvider;
});
define('utils/database/template/templateFilter',['require','underscore'],function(require){
	var _ = require('underscore');

	templateFilter.$inject = ['$log','templateDefaultContext'];
	function templateFilter($log, defaultContext){

		function template(input, context){

			// if there is no template just return the string
			if (!~input.indexOf('<%')){
				return input;
			}

			// build context (extend it with the default context)
			context = _.extend(context || {}, defaultContext);

			// filters don't throw errors when used from within templates
			// therefore we need catch any errors here... (we may decide to drop this if it hits performance too mutch...)
			try{
				return _.template(input)(context);
			} catch(e){
				$log.error("ERROR: \"" + e.message + "\" in the following template: ", input);
				return "";
			}

		}

		return template;

	}

	return templateFilter;
});
define('utils/database/template/main',['require','./templateObjProvider','./templateFilter'],function(require){
	return require('./templateObjProvider')(
		// $filter('template')
		function(){
			return require('./templateFilter')(console, {}); // $log, defaultContext
		}
	);

});
define('utils/database/collection/collectionProvider',['underscore'],function(_){
	/*
	 * The constructor for an Array wrapper
	 */

	function collectionService(){

		function Collection (arr) {
			if (arr instanceof Collection) {
				return arr;
			}

			// Make sure we are creating this array out of a valid argument
			if (!_.isUndefined(arr) && !_.isArray(arr) && !(arr instanceof Collection)) {
				throw new Error('Collections can only be constructed from arrays');
			}

			this.collection = arr || [];
			this.length = this.collection.length;

			// pointer to the current location within the array
			// we start with -1 so that the initial next points to the begining of the array
			this.pointer = -1;
		}

		_.extend(Collection.prototype,{

			first : function first(){
				this.pointer = 0;
				return this.collection[this.pointer];
			},

			last : function last(){
				this.pointer = this.collection.length - 1;
				return this.collection[this.pointer];
			},

			end : function end(){
				this.pointer = this.collection.length;
				return undefined;
			},

			current : function(){
				return this.collection[this.pointer];
			},

			next : function(){
				return this.collection[++this.pointer];
			},

			previous : function(){
				return this.collection[--this.pointer];
			},

			// add list of items to the collection
			add : function(list){
				// dont allow adding nothing
				if (!arguments.length) {
					return this;
				}

				// make sure list is as an array
				list = _.isArray(list) ? list : [list];
				this.collection = this.collection.concat(list);

				this.length = this.collection.length;

				return this;
			},

			// return the item at index
			at: function(index){
				return this.collection[index];
			}
		});


		// Stuff we took out of bootstrap that can augment the collection
		// **************************************************************
		var methods = ['where','filter'];
		var slice = Array.prototype.slice;

		// Mix in each Underscore method as a proxy to `Collection#models`.
		_.each(methods, function(method) {
			Collection.prototype[method] = function() {
				var args = slice.call(arguments);
				args.unshift(this.collection);
				var coll = _[method].apply(_,args);
				return new Collection(coll);
			};
		});

		return Collection;
	}

	return collectionService;


});
define('utils/database/randomizer/randomizerProvider',['underscore'],function(_){

	// @TODO: repeat currently repeats only the last element, we need repeat = 'set' or something in order to prevent re-randomizing of exRandom...

	RandomizerProvider.$inject = ['randomizeInt', 'randomizeRange', 'Collection'];
	function RandomizerProvider(randomizeInt, randomizeRange, Collection){

		function Randomizer(){
			this._cache = {
				random : {},
				exRandom : {},
				sequential : {}
			};
		}

		_.extend(Randomizer.prototype, {
			random: random,
			exRandom: exRandom,
			sequential: sequential
		});

		return Randomizer;

		function random(length, seed, repeat){
			var cache  = this._cache.random;

			if (repeat && !_.isUndefined(cache[seed])) {
				return cache[seed];
			}

			// save result in cache
			cache[seed] = randomizeInt(length);

			return cache[seed];
		}

		function sequential(length, seed, repeat){
			var cache = this._cache.sequential;
			var coll = cache[seed];
			var result;

			// if needed create collection and set it in seed
			if (_.isUndefined(coll)){
				coll = cache[seed] = new Collection(_.range(length));
				return coll.first();
			}

			if (coll.length !== length){
				throw new Error("This seed  ("+ seed +") points to a collection with the wrong length, you can only use a seed for sets of the same length");
			}

			// if this is a repeated element:
			if (repeat) {
				return coll.current();
			}

			// if we've reached the end
			result = coll.next();

			// if we've reached the end of the collection (next)
			if (_.isUndefined(result)){
				return coll.first();
			} else {
				return result;
			}
		}

		function exRandom(length, seed, repeat){
			var cache = this._cache.exRandom;
			var coll = cache[seed];
			var result;

			// if needed create collection and set it in seed
			if (_.isUndefined(coll)){
				coll = cache[seed] = new Collection(randomizeRange(length));
				return coll.first();
			}

			if (coll.length !== length){
				throw new Error("This seed  ("+ seed +") points to a collection with the wrong length, you can only use a seed for sets of the same length");
			}

			// if this is a repeated element:
			if (repeat) {
				return coll.current();
			}

			// if we've reached the end
			result = coll.next();

			// if we've reached the end of the collection (next)
			// we should re-randomize
			if (_.isUndefined(result)){
				coll = cache[seed] = new Collection(randomizeRange(length));
				return coll.first();
			} else {
				return result;
			}
		}

	}

	return RandomizerProvider;

});
define('utils/database/queryProvider',['underscore'],function(_){

	queryProvider.$inject = ['Collection','piConsole'];
	function queryProvider(Collection, $console){

		function queryFn(query, collection, randomizer){
			var coll = new Collection(collection);

			// shortcuts:
			// ****************************

			// use function instead of query object.
			if (_.isFunction(query)){
				return query(collection);
			}

			// pure string query
			if (_.isString(query) || _.isNumber(query)){
				query = {set:query, type:'random'};
			}

			// narrow down by set
			// ****************************
			if (query.set){
				coll = coll.where({set:query.set});
			}

			// narrow down by data
			// ****************************
			if (_.isString(query.data)){
				coll = coll.filter(function(q){
					return q.handle === query.data || (q.data && q.data.handle === query.data);
				});
			}

			if (_.isPlainObject(query.data)){
				coll = coll.where({data:query.data});
			}

			if (_.isFunction(query.data)){
				coll = coll.filter(query.data);
			}

			// pick by type
			// ****************************

			// the default seed is namespace specific just to minimize the situations where seeds clash across namespaces
			var seed = query.seed || ('$' + collection.namespace + query.set);
			var length = coll.length;
			var repeat = query.repeat;
			var at;
			var err;

			switch (query.type){
				case undefined:
				case 'byData':
				case 'random':
					at = randomizer.random(length,seed,repeat);
					break;
				case 'exRandom':
					at = randomizer.exRandom(length,seed,repeat);
					break;
				case 'sequential':
					at = randomizer.sequential(length,seed,repeat);
					break;
				case 'first':
					at = 0;
					break;
				case 'last':
					at = length-1;
					break;
				default:
					throw new Error('Unknow query type: ' + query.type);
			}

			if (_.isUndefined(coll.at(at))) {
				err = new Error('Query failed, object (' + JSON.stringify(query) +	') not found. If you are trying to apply a template, you should know that they are not supported for inheritance.');
				$console('query').error(err);
				throw err;
			}

			return coll.at(at);
		}

		return queryFn;
	}

	return queryProvider;
});
/*
 * inflates an object
 * this function is responsible for inheritance
 *
 * function inflate(source,coll, randomizer, recursive, counter)
 * @param source: the object to inflate
 * @param coll: a collection to inherit from
 * @param randomizer: a randomizer object for the query
 * @param recursive: private use only, is this inside the recursion (true) or top level (false)
 * @param depth: private use only, a counter for the depth of the recursion
 */
define('utils/database/inflateProvider',['require','underscore'],function(require){
	var _ = require('underscore');

	inflateProvider.$inject = ['databaseQuery','$rootScope','piConsole'];
	function inflateProvider(query, $rootScope, $console){

		function customize(source){
			// check for a custom function and run it if it exists
			if (_.isFunction(source.customize)){
				source.customize.apply(source, [source, $rootScope.global]);
			}
			return source;
		}

		// @param source - object to inflate
		// @param type - trial stimulus or media
		// @param recursive - whether this is a recursive call or not
		function inflate(source, coll, randomizer, recursive, depth){

			// protection against infinte loops
			// ***********************************
			depth = recursive ? --depth : 10;

			if (!depth) {
				throw new Error('Inheritance loop too deep, you can only inherit up to 10 levels down');
			}

			if (!_.isPlainObject(source)){
				throw new Error('You are trying to inflate a non object');
			}

			var parent
				// create child
				, child = _.cloneDeep(source)
				, err
				, inheritObj = child.inherit;


			// no inheritance
			// ***********************************

			// if we do not need to inherit anything, simply return source
			if (!child.inherit) {
				// customize only on the last call (non recursive)
				!recursive && customize(child);
				return child;
			}

			// get parent
			// ***********************************
			parent = query(inheritObj, coll, randomizer);

			// if inherit target was not found
			if (!parent){
				err = new Error('Query failed, object (' + JSON.stringify(inheritObj) +	') not found.');
				$console('query').error(err);
				throw err;
			}

			// inflate parent (recursively)
			parent = inflate(
				parent,
				coll,
				randomizer,
				true,
				depth
			);

			// extending the child
			// ***********************************
			if (inheritObj.merge && !_.isArray(inheritObj.merge)){
				throw new Error('Inheritance error: inherit.merge must be an array.');
			}

			// start inflating child (we have to extend selectively...)
			_.each(parent, function(value, key){
				var childProp, parentProp;
				// if this key is not set yet, copy it out of the parent
				if (!(key in child)){
					child[key] = _.isFunction(value) ? value : _.cloneDeep(value);
					return;
				}

				// if we have a merge array,
				if (_.indexOf(inheritObj.merge, key) != -1){
					childProp = child[key];
					parentProp = value;

					if (_.isArray(childProp)){
						if (!_.isArray(parentProp)){
							throw new Error('Inheritance error: You tried merging an array with an non array (for "' + key + '")');
						}
						child[key] = childProp.concat(parentProp);
					}

					if (_.isPlainObject(childProp)){
						if (!_.isPlainObject(parentProp)){
							throw new Error('Inheritance error: You tried merging an object with an non object (for "' + key + '")');
						}
						_.extend(childProp, parentProp);
					}

				}
			});

			// we want to extend the childs data even if it already exists
			// its ok to shallow extend here (because by definition parent was created for this inflation)
			if (parent.data){
				child.data = _.extend(parent.data, child.data || {});
			}

			// Personal customization functions - only if this is the last iteration of inflate
			// This way the customize function gets called only once.
			!recursive && customize(child);

			// return inflated trial
			return child;
		}

		return inflate;
	}

	return inflateProvider;
});
/*
 *	The store is a collection of collection devided into namespaces.
 *	You can think of every namespace/collection as a table.
 */
define('utils/database/store/storeProvider',['underscore'],function(_){

	storeProvider.$inject = ['Collection'];
	function storeProvider(Collection){

		function Store(){
			this.store = {};
		}

		_.extend(Store.prototype, {
			create: function create(nameSpace){
				if (this.store[nameSpace]){
					throw new Error('The name space ' + nameSpace + ' already exists');
				}
				this.store[nameSpace] = new Collection();
				this.store[nameSpace].namespace = nameSpace;
			},

			read: function read(nameSpace){
				if (!this.store[nameSpace]){
					throw new Error('The name space ' + nameSpace + ' does not exist');
				}
				return this.store[nameSpace];
			},

			update: function update(nameSpace, data){
				var coll = this.read(nameSpace);
				coll.add(data);
			},

			del: function del(nameSpace){
				this.store[nameSpace] = undefined;
			}
		});

		return Store;
	}

	return storeProvider;
});
define('utils/database/databaseSequenceProvider',['require','underscore'],function(require){
	var _ = require('underscore');

	SequenceProvider.$inject = ['MixerSequence'];
	function SequenceProvider(MixerSequence){

		/**
		 * Sequence Constructor:
		 * Manage the progression of a sequence, including parsing (mixing, inheritance and templating).
		 * @param  {String  } namespace [pages or questions (the type of db.Store)]
		 * @param  {Array   } arr       [a sequence to manage]
		 * @param  {Database} db        [the db itself]
		 */

		function Sequence(namespace, arr,db){
			this.namespace = namespace;
			this.mixerSequence = new MixerSequence(arr);
			this.db = db;
		}

		_.extend(Sequence.prototype, {
			// only mix
			next: function(context){
				this.mixerSequence.next(context);
				return this;
			},

			// anti mix
			prev: function(context){
				this.mixerSequence.prev(context);
				return this;
			},

			/**
			 * Return the element currently in focus.
			 * It always returns either an element or undefined (mixers are abstrcted away)
			 * @param  {[type]} context [description]
			 * @return {[type]}         [description]
			 */
			current: function(context, options){
				context || (context = {});
				// must returned an element or undefined
				var obj = this.mixerSequence.current(context);

				// in case this is the end of the sequence
				if (!obj){
					return obj;
				}

				return this.db.inflate(this.namespace, obj, context, options);
			},

			/**
			 * Returns an array of elements, created by proceeding through the whole sequence.
			 * @return {[type]} [description]
			 */
			all: function(context, options){
				var sequence = [];

				var el = this.next().current(context, options);
				while (el){
					sequence.push(el);
					el = this.next().current(context, options);
				}

				return sequence;
			}
		});

		return Sequence;
	}

	return SequenceProvider;
});
define('utils/database/databaseProvider',['require','underscore'],function(require){
	var _ = require('underscore');

	DatabaseProvider.$inject = ['DatabaseStore', 'DatabaseRandomizer', 'databaseInflate', 'templateObj', 'databaseSequence'];
	function DatabaseProvider(Store, Randomizer, inflate, templateObj, DatabaseSequence){

		function Database(){
			this.store = new Store();
			this.randomizer = new Randomizer();
		}

		_.extend(Database.prototype, {
			createColl: function(namespace){
				this.store.create(namespace);
			},

			getColl: function(namespace){
				return this.store.read(namespace);
			},

			add: function(namespace, query){
				var coll = this.store.read(namespace);
				coll.add(query);
			},

			inflate: function(namespace, query, context, options){
				var coll = this.getColl(namespace);
				var result;

				// inherit
				if (!query.$inflated || query.reinflate) {
					query.$inflated = inflate(query, coll, this.randomizer);
				}

				// template
				if (!query.$templated || query.regenerateTemplate){
					context[namespace + 'Meta'] = query.$meta;
					context[namespace + 'Data'] = templateObj(query.$inflated.data || {}, context, options); // make sure we support
					query.$templated = templateObj(query.$inflated, context, options);
				}

				result = query.$templated;

				// set flags
				if (context.global && result.addGlobal){
					_.extend(context.global, result.addGlobal);
				}

				if (context.current && result.addCurrent){
					_.extend(context.current, result.addCurrent);
				}

				return query.$templated;
			},

			sequence: function(namespace, arr){
				if (!_.isArray(arr)){
					throw new Error('Sequence must be an array.');
				}
				return new DatabaseSequence(namespace, arr, this);
			}
		});

		return Database;
	}

	return DatabaseProvider;
});
define('utils/database/main',['require','underscore','./mixer/main','./template/main','./collection/collectionProvider','./randomizer/randomizerProvider','./queryProvider','./inflateProvider','./store/storeProvider','./databaseSequenceProvider','./databaseProvider'],function(require){
	var _ = require('underscore');

	var mixerSequence = require('./mixer/main');
	var templateObj = require('./template/main');

	var collection = require('./collection/collectionProvider')();

	var DatabaseRandomizer = require('./randomizer/randomizerProvider')(
		randomInt,// randomize int
		randomArr,// randomize range
		collection
	);

	var databaseQuery = require('./queryProvider')(
		collection,
		piConsole
	);

	var databaseInflate = require('./inflateProvider')(
		databaseQuery,
		{global:window.piGlobal}, // rootscope
		piConsole
	);

	var DatabaseStore = require('./store/storeProvider')(
		collection
	);

	var databaseSequence = require('./databaseSequenceProvider')(
		mixerSequence
	);


	var Database = require('./databaseProvider')(
		DatabaseStore,
		DatabaseRandomizer,
		databaseInflate,
		templateObj,
		databaseSequence
	);

	return Database;

	function randomArr(length){
		return _.shuffle(_.range(length));
	}

	function randomInt(length){
		return Math.floor(Math.random()*length);
	}

	function piConsole(){
		return console;
	}
});
define('app/sequencer/database',['require','utils/database/main'],function(require){
	var Database = require('utils/database/main');
	return new Database();
});
/**
 * Go to a destination within the sequence (must be a property of a sequence)
 * @param  {String} target destination type
 * @param  {Object} properties destination options
 * @return {Object}        result element
 */
define('app/sequencer/sequenceGoto',['require','underscore'],function(require){
	var _ = require('underscore');

	return go;

	function go(destination, properties, context){
		var mixerSequence = this.mixerSequence;

		switch (destination){
			case 'nextWhere':
				where('next', properties, context, mixerSequence);
				break;
			case 'previousWhere':
				where('next', properties, context, mixerSequence);
				break;
			case 'current':
				// don't need to do anything...
				break;
			case 'first':
				do {mixerSequence.prev(context);} while (mixerSequence.current(context));
				break;
			case 'last':
				do {mixerSequence.next(context);} while (mixerSequence.current(context));
				mixerSequence.prev();
				break;
			case 'end':
				do {mixerSequence.next(context);} while (mixerSequence.current(context));
				break;
			case 'next' :
				mixerSequence.next(context); // get the next trial, in case there are no more trials, returns undefined
				break;
			default:
				throw new Error('Unknow destination "' + destination + '" for goto.');
		}

		return this;
	}

	function where(direction, properties, context, sequence){
		var curr;

		do {
			sequence[direction]();
			curr = sequence.current(context);
		} while (curr && !_.callback(properties)(curr.data));
	}
});
/*
 * this file holds the trial sequence
 */
define('app/sequencer/taskSequence',[],function(){
	var sequence;

	/**
	 * Getter/Setter for sequence
	 *
	 * @param  {Object || null} obj 	The new script, if it is not set this is simply a getter.
	 * @return {Object}     			The full script
	 */
	function getter(obj){
		obj && (sequence = obj);
		return sequence;
	}

	return getter;
});
/*
 * media preloader
 */
define('utils/preloader',['require','jquery'],function(require){
	var $ = require('jquery');

	var srcStack = [];				// an array holding all our sources
	var defStack = [];				// an array holding all the deferreds
	var stackDone = 0;				// the number of sources we have completed downloading
	var allDone = $.Deferred();		// General deferred, notifies upon source completion
	var images = {};

	// load a single source
	function load(src, type){
		type = type || 'image';
		// if we haven't loaded this yet
		if ($.inArray(src, srcStack) == -1) {
			var deferred = $.Deferred();

			switch (type) {
				case 'template':
					requirejs(['text!' + src], function(){
						deferred.resolve();
					}, function(){
						throw new Error('Template not found: ' + src);
					});
					break;
				case 'image':
					/* falls through */
				default :
					var img = new Image();	// create img object
					$(img).on('load',function(){deferred.resolve();}); // resolve deferred on load
					$(img).one('error',function(){
						img.src = "";
						img.src = src;
						$(img).on('error', function(){throw new Error('Image not found: "' + src + '"');});
					}); // reject deferred on error
					img.src = src;
					images[src] = img;
					break;
			}

			// keep defered and source for later.
			defStack.push(deferred);
			srcStack.push(src);

			// count this defered as done
			deferred
				.done(function(){
					// increment the completed counter
					stackDone++;
					// notify allDone that we advanced another step
					allDone.notify(stackDone,defStack.length);
				});

			return deferred;
		}
		// the source was already loaded
		return false;
	}

	return {
		// loads a single source
		add: load,

		getImage: function(url){
			return images[url].cloneNode();
		},

		activate: function(){
			// fail or reject allDone according to our defStack
			$.when.apply($,defStack)
				.done(function(){allDone.resolve();})
				.fail(function(){allDone.reject();});

			return allDone.promise();
		},

		// reset globals so we can reuse this object
		reset: function(){
			srcStack = [];
			defStack = [];
			stackDone = 0;
			allDone = this.state = $.Deferred();
		},

		// returns a deferred describing the state of this preload
		state: allDone
	};

});
/*
 * build the url for this src (add the generic base_url)
 */
define('app/task/build_url',['require','underscore','./settings'],function(require){

	var _ = require('underscore')
		,settingsGetter = require('./settings');

	return function(url, type){
		var settings = settingsGetter();
		var base_url;

		// the base url setting may be either a string, or an object with the type as a field
		if (_.isString(settings.base_url)) {
			base_url = settings.base_url;
		} else {
			if (_.isObject(settings.base_url)) {
				base_url = settings.base_url[type];
			}
		}

		// it this is a dataUrl type of image, we don't need to append the baseurl
		if (type == 'image' && /^data:image/.test(url)){
			return url;
		}

		// make sure base url is set, and add trailing slash if needed
		if (!base_url) {
			base_url="";
		} else {
			if (base_url[base_url.length-1] != "/") {
				base_url+="/";
			}
		}

		return base_url + url;
	};
});

/*
 * gets all media that needs preloading and preloads it
 */
define('app/sequencer/sequencePreload',['require','underscore','utils/preloader','app/task/build_url'],function(require){
	var _ = require('underscore')
		,preload = require('utils/preloader')
		,build_url = require('app/task/build_url');

	function loadMedia(media){
		// if this is an image, preload it
		if (!_.isUndefined(media.image)) {
			preload.add(build_url(media.image, 'image'),'image');
		}
		if (!_.isUndefined(media.template)) {
			preload.add(build_url(media.template,'template'),'template');
		}
	}

	var loadStimulus = function(stimulus) {
		if (stimulus.media) {
			loadMedia(stimulus.media);
		}
	};

	var loadInput = function(input){
		if (input.element) {
			loadMedia(input.element);
		}
	};

	var loadTrial = function(trial){
		_.each(trial.layout || [], loadStimulus);
		_.each(trial.stimuli || [], loadStimulus);
		_.each(trial.input || [], loadInput);
	};

	// load trials in sequence (essentialy, recursively pick out the trials out of the mixer)
	var loadSequence = function(sequence){
		_.each(sequence,function(element){
			if (!_.isUndefined(element.mixer)) {
				loadSequence(element.data);
			} else {
				loadTrial(element);
			}
		});
	};

	function loadScript(script){
		// load media sets
		_.each(script.mediaSets || [], loadMedia);

		// load stimsets
		_.each(script.stimulusSets || [], loadStimulus);

		// load trialsets
		_.each(script.trialSets || [], loadTrial);

		loadSequence(script.sequence);
	} // load script

	// accepts a piece of script and a type
	// @param script: a piece of script
	// @param type: what sort of object this is (media/stimulus/trial)
	// @param reset: should we reset the preloader before activating it (use if for some reason we lost the cache...)
	// @returns a deferred object
	return function(script, type, reset){
		if (reset) {
			preload.reset();
		}

		switch (type){
			case 'media'	: loadMedia(script); break;
			case 'stimulus'	: loadStimulus(script); break;
			case 'trial'	: loadTrial(script); break;
			case 'script'	:
				/* falls through */
			default:
				loadScript(script); break;
		}
		return preload.activate();
	};
});
/*
 * this file is resposible for taking the experiment script (json) and parsing it
 */

define('app/task/parser',['require','underscore','app/task/script','../sequencer/database','../sequencer/sequenceGoto','../sequencer/taskSequence','../sequencer/sequencePreload'],function(require){
	// load dependancies
	var _ = require('underscore');
	var scriptGetter = require('app/task/script');
	var db = require('../sequencer/database');
	var go = require('../sequencer/sequenceGoto');
	var sequenceSetter = require('../sequencer/taskSequence');
	var preload = require('../sequencer/sequencePreload');

	return function(){
		var script = scriptGetter();


		db.createColl('trial');
		db.createColl('stimulus');
		db.createColl('media');

		db.add('trial', script.trialSets || []);
		db.add('stimulus', script.stimulusSets || []);
		db.add('media', script.mediaSets || []);

		if (!_.isArray(script.sequence)){
			throw new Error('You must set a sequence array.');
		}

		var sequence = db.sequence('trial', script.sequence);
		sequence.go = go; // see sequence/goto.js to understand why we are doing this
		sequenceSetter(sequence);

		// preload and return deferred
		return preload(script);
	};
});

define('utils/pubsub',['require','underscore'],function(require){
	var _ = require('underscore');

	// the pubsub object itself
	var pubsub = {};

	// the topic/subscription hash
	var cache = {};
	var counters ={};

	pubsub.publish = function(/* String */topic, /* Array? */args){
		// summary:
		//		Publish some data on a named topic.
		// topic: String
		//		The channel to publish on
		// args: Array?
		//		The data to publish. Each array item is converted into an ordered
		//		arguments on the subscribed functions.
		//
		// example:
		//		Publish stuff on '/some/topic'. Anything subscribed will be called
		//		with a function signature like: function(a,b,c){ ... }
		//
		//	|		$.publish("/some/topic", ["a","b","c"]);
		// log(topic,args);

		cache[topic] && _.each(cache[topic], function(func){
			func.apply(pubsub, args || []);
		});

	};

	pubsub.subscribe = function(/* String */topic, /* Function */callback){
		// summary:
		//		Register a callback on a named topic.
		// topic: String
		//		The channel to subscribe to
		// subStack: Array
		//		Optional, an array to which we push the subscription handle
		// callback: Function
		//		The handler event. Anytime something is $.publish'ed on a
		//		subscribed channel, the callback will be called with the
		//		published array as ordered arguments.
		//
		// returns: Array
		//		A handle which can be used to unsubscribe this particular subscription.
		//
		// example:
		//	|	$.subscribe("/some/topic", function(a, b, c){ /* handle data */ });
		//
		// example:
		//	|	$.subscribe("/some/topic", "/handle/stack", function(a, b, c){ /* handle data */ });

		var subStack;

		// if second argument is not a call back use it as the subscription stack
		if (_.isFunction(callback)) {
			subStack = [];
		} else {
			subStack = arguments[1];
			callback = arguments[2];
		}

		if(!cache[topic]){
			cache[topic] = {};
			counters[topic] = 0;
		}

		cache[topic][counters[topic]++] = callback;

		subStack.push([topic, callback]);
		return [topic, callback]; // Array
	};

	pubsub.unsubscribe = function(/* Array */handle){
		// summary:
		//		Disconnect a subscribed function for a topic.
		// handle: Array
		//		The return value from a $.subscribe call.
		// example:
		//	|	var handle = $.subscribe("/something", function(){});
		//	|	$.unsubscribe(handle);

		var t = handle[0];
		cache[t] && _.each(cache[t], function(func, idx){
			func == handle[1] && delete(cache[t][idx]);
		});
	};

	return pubsub;
});





/*
 * detects touch devices
 */

define('utils/is_touch',[],function(){
	return !!('ontouchstart' in window) ? true : false;
});

define('utils/interface/bindings/click',['require','jquery','utils/is_touch'],function(require){
	var $ = require('jquery')
		, is_touch_device = require('utils/is_touch');

	/*
	 * takes care of click events
	 *
	 * accepts a listener object to decorate and definitions
	 *
	 * the function accepts either
	 *		a stimulus handle to which to bind the event (definitions.stimHandle)
	 *		or an element to add to the canvas definitions.element (optionaly a jquery css object may be added: definitions.css)
	 *
	 * -- if we want to attach the event to an existing element
	 * definitions = {
	 *		stimHandle: 'firstStim'
	 * }
	 * This attaches to the [data-handle="firstStim"] stimulus.
	 *
	 * -- if we want to create a interface specific element
	 * definitions = {
	 *		element: $('<div>'),
	 *		css: {background:red; 'font-size': 2em'}   // optional
	 * }
	 */

	return function(listener,definitions){
		var eventName = is_touch_device ? 'touchstart' : 'mousedown';
		var $element = definitions.element ? $(definitions.element) : false;

		listener.on = function(callback){
			var activateCallback = function(e){ callback(e,eventName); };

			// If we're binding to an existing element, bind to its appropriate handle
			if ($element){
				$(document).on(eventName + '.interface','[data-handle="'+definitions.stimHandle + '"]', activateCallback);
			} else {
				// the element to attach
				$element
					.css(definitions.css || {})
					.appendTo('#canvas')							// @todo, not great form, we should probably have a variable pointing there...
					.on(eventName+'.interface',activateCallback);
			}
		};

		listener.off = function(){
			if ($element){
				$(document).off(eventName + '.interface','[data-handle="'+definitions.stimHandle + '"]');
			} else {
				$element.remove();									// this also removes any attached events
			}
		};
	};
});
define('utils/interface/bindings/mouseEvents',['require','jquery','underscore'],function(require){
	var $ = require('jquery')
		, _ = require('underscore');

	/**
	 * Decorates a Listener with the on and off functions for a mouse event
	 *
	 * It attaches a listener for event name to all elements that have definitions.stimHandle
	 *
	 * @param  {String} eventName   The event name to bind
	 * @param  {Object} listener    The listener object to decorate
	 * @param  {Object} definitions A definitions (options) object
	 * @return {Object}             A decorator function
	 */
	function mouseEventsDecorator(eventName, listener,definitions){
		listener.on = function(callback){
			function activateCallback(e){
				callback(e,eventName);
			};

			// If we're binding to an existing element, bind to its appropriate handle
			$(document).on(eventName + '.interface','[data-handle="'+definitions.stimHandle + '"]', activateCallback);
		};

		listener.off = function(){
			$(document).off(eventName + '.interface','[data-handle="'+definitions.stimHandle + '"]');
		};
	}

	return mouseEventsDecorator;
});
define('utils/interface/bindings/keypressed',['require','jquery'],function(require){
	var $ = require('jquery');

	/*
	 * key pressed listener
	 * reqires key
	 *
	 * key can be either charCode or string.
	 * or an array of charCode/strings.
	 */

	// we monitor all key up events so that we trigger only once per key down
	var keyDownArr = [];
	$(document).on("keyup.keypressed",function(e){
		keyDownArr[e.which] = false; // unset flag to prevent multi pressing of a key
	});

	// creates an object that is capable of activating a keypressed event and removing it
	var Keypressed = function(definitions){
		// make sure key is array
		var key = $.isArray(definitions.key) ? definitions.key : [definitions.key];
		var eventName = "keydown.interface." + definitions.handle;

		// accept both keyCode and the key itself
		var target = $.map(key,function(value){
			return typeof value == "string" ? value.toUpperCase().charCodeAt(0) : value;
		});

		// attach listener
		this.on = function(callback){
			$(document).on(eventName,function(e){
				if (!keyDownArr[e.which] && $.inArray(e.which,target) != -1) {
					keyDownArr[e.which] = true; // set flag to prevent multi pressing of a key
					callback(e,'keydown');
				}
			});
		};

		// remove listener
		this.off = function(){
			$(document).off(eventName);
		};

	};

	return function(listener,definitions){
		// decorate listener with new keypressed
		$.extend(listener,new Keypressed(definitions));
	};

});
define('utils/interface/bindings/keyup',['require','jquery'],function(require){
	var $ = require('jquery');

	/*
	 * key up listener
	 * reqires definitions.key
	 *
	 * key can be either charCode or string.
	 * or an array of charCode/strings.
	 */

	// creates an object that is capable of activating a keypressed event and removing it
	var Keyup = function(definitions){
		// make sure key is array
		var key = $.isArray(definitions.key) ? definitions.key : [definitions.key];
		var eventName = "keyup.interface." + definitions.handle;

		// accept both keyCode and the key itself
		var target = $.map(key,function(value){
			return typeof value == "string" ? value.toUpperCase().charCodeAt(0) : value;
		});

		// attach listener
		this.on = function(callback){
			$(document).on(eventName,function(e){
				if ($.inArray(e.which,target) !== -1) {
					callback(e,'keyup');
				}
			});
		};

		// remove listener
		this.off = function(){
			$(document).off(eventName);
		};

	};

	return function(listener,definitions){
		// decorate listener with new keypressed
		$.extend(listener,new Keyup(definitions));
	};

});
define('utils/timeout',['require','underscore'],function(require){

	/*
	 * timeout
	 *
	 * timeout(time,callback): shortcut for setTimeout
	 * timeout(time,stack,callback): shortcut for setTimeout, sets timer_id into stack array
	 *
	 * @todo: poll timer instead of using one long timeout
	 * http://ejohn.org/blog/accuracy-of-javascript-time/
	 * http://stackoverflow.com/questions/196027/is-there-a-more-accurate-way-to-create-a-javascript-timer-than-settimeout
	 * http://www.sitepoint.com/creating-accurate-timers-in-javascript/
	 * http://stackoverflow.com/questions/6875625/does-javascript-provide-a-high-resolution-timer/6875666#6875666
	 * http://www.websanova.com/blog/javascript/how-to-write-an-accurate-game-timer-in-javascript#.UmZ1PHh4uak
	 */

	var _ = require('underscore');

	return function timeout(){
		var time = arguments[0];
		var stack = _.isArray(arguments[1]) ? arguments[1] : [];
		var callback = _.isFunction(arguments[1]) ? arguments[1] : arguments[2];
		var timer_id = 0;

		if (!time) {
			callback.call();
		} else {
			timer_id = setTimeout(callback,time);
			stack.push(timer_id);
		}

		return timer_id;
	};

});

/**
 *	Takes a properties objects and returns the result of a randomization:
 *	If it is an array - pick a random member
 *	If it is an object pick from within a range
 *	If it is a function return its result using the context
 *	Otherwise simply return the properties
 */
define('utils/simpleRandomize',['require','underscore'],function(require){
	var _ = require('underscore');

	function simpleRandomize(properties, context){

		if (_.isArray(properties)) {
			var index = Math.floor(Math.random()*properties.length);
			return properties[index];
		}

		if (_.isFunction(properties)) {
			return properties.call(context);
		}

		// this must be after the test for arrays and functions, because they are considered objects too
		if (_.isPlainObject(properties)) {
			if (!_.isNumber(properties.min) || !_.isNumber(properties.max) || properties.min > properties.max) {
				throw new Error('randomization objects need both a max and a minimum property, also max has to be larger than min');
			}
			return properties.min + (properties.max - properties.min) * Math.random();
		}

		// if this is not a randomization object simply return
		return properties;
	}

	return simpleRandomize;
});
define('utils/interface/bindings/timeout',['require','utils/timeout','utils/simpleRandomize'],function(require){
	var timeout = require('utils/timeout')
		, randomize = require('utils/simpleRandomize');

	/*
	 * timeout listenter
	 *
	 * requires definitions.duration, otherwise fires immediately
	 */

	return function(listener, definitions){

		// all this has to happen in a seperate module (closure) so that the different timers don't overide one anather
		var Timeout = (function(){

			var duration = randomize(definitions.duration) || 0;
			var timerID;

			return {
				on : function(callback){
					timerID = timeout(duration,function(){
						callback({},'timeout');
					});
				},

				off : function(){
					clearTimeout(timerID);
				}
			};
		})();

		listener.on = Timeout.on;
		listener.off = Timeout.off;
	};
});
define('utils/interface/binder',['require','jquery','./bindings/click','./bindings/mouseEvents','./bindings/keypressed','./bindings/keyup','./bindings/timeout'],function(require){
	var $ = require('jquery')
		, click = require('./bindings/click')
		, mouseEvents = require('./bindings/mouseEvents')
		, keypressed = require('./bindings/keypressed')
		, keyup = require('./bindings/keyup')
		, timeout = require('./bindings/timeout');

 	/*
	 * this function decorates a listener object with on and off functions
	 * it takes listener (the object) and the binding definitions as parameters
	 *
	 * the function returns true in case the decoration was successfull and false in case it was not.
	 */
	return function(listener,definitions){
		var on = definitions.on; // what type of binding is this?

		// if the on and off function are set explicitly, set them in;
		if (typeof on === 'function') {
			listener.on = definitions.on;
			listener.off = definitions.off;
			if (typeof listener.off !== 'function') {
				throw new Error("Interface off is not a function for " + definitions.handle);
			}
			return true;
		}

		switch (on){
			/*
			 * the archtipical events
			 */
			case 'keypressed'	:
				keypressed(listener, definitions);
				break;

			case 'keyup'		:
				keyup(listener, definitions);
				break;

			case 'click'		:
				click(listener,definitions);
				break;

			case 'mouseup'	:
				mouseEvents('mouseup', listener,definitions);
				break;

			case 'mousedown'	:
				mouseEvents('mousedown', listener,definitions);
				break;

			case 'mouseenter'	:
				mouseEvents('mouseenter', listener,definitions);
				break;

			case 'mouseleave'	:
				mouseEvents('mouseleave', listener,definitions);
				break;

			case 'timeout'		:
				timeout(listener,definitions);
				break;

			/*
			 * Shortcuts
			 */

			case 'enter'	:
				keypressed(listener, $.extend({key:13},definitions));
				break;

			case 'space'	:
				keypressed(listener, $.extend({key:32},definitions));
				break;

			case 'esc'	:
				keypressed(listener, $.extend({key:27},definitions));
				break;

			case 'leftTouch'	:
				definitions.element = $('<div>')
					.css({
						position: 'absolute',
						left: 0,
						width: '30%',
						height: '100%',
						background: '#00FF00',
						opacity: 0.3
					});

				click(listener,definitions);
				break;

			case 'rightTouch'	:
				definitions.element = $('<div>')
					.css({
						position: 'absolute',
						right: 0,
						width: '30%',
						height: '100%',
						background: '#00FF00',
						opacity: 0.3
					});

				click(listener,definitions);
				break;

			case 'topTouch'	:
				definitions.element = $('<div>')
					.css({
						position: 'absolute',
						top: 0,
						width: '100%',
						height: '30%',
						background: '#00FF00',
						opacity: 0.3
					});

				click(listener,definitions);
				break;

			case 'bottomTouch'	:
				definitions.element = $('<div>')
					.css({
						position: 'absolute',
						bottom: 0,
						width: '100%',
						height: '30%',
						background: '#00FF00',
						opacity: 0.3
					});

				click(listener,definitions);
				break;

			default:
				throw new Error('You have an input element without a recognized "on" property: ' + on);

		}
		return true;
	};
});
define('utils/interface/triggerEvent',['require','utils/pubsub'],function(require){
	var pubsub = require('utils/pubsub');

	/*
	 * manages publishing the event
	 */
	return function triggerEvent(event,type,definitions, latency){

		var data = {
			timestamp	: +new Date(),
			latency		: latency,
			handle		: definitions.handle,			// right/left and so on
			type		: type,							// holds click/keypressed and so on
			e			: event							// the original event if available. just in case
		};

		pubsub.publish("input",[data]);
	};

});

define('utils/interface/listener',['require','./binder','./triggerEvent'],function(require){

	var binder = require('./binder')
		, trigger = require('./triggerEvent');
	/*
	 * listener constructor
	 */
	function Listener(definitions, interfaceObj){

		// set listener handle
		this.handle = definitions.handle;

		// decorate listener with on and off functions
		binder(this,definitions);

		// activate listener:
		this.on(function(e,type){
			trigger(e,type,definitions, interfaceObj.getLatency());
		});

		// for now the destroyer simply unbinds the event
		this.destroy = this.off;
	};

	return Listener;

});

/* global performance */
define('utils/interface/now',[],function(){

	var nowFn;

	// if performance is set, look for the now function

	if (!!window.performance) {
		nowFn = performance.now  ||
        performance.mozNow    ||
        performance.webkitNow ||
        performance.msNow     ||
        performance.oNow;
	}

	// if we have now proxy it (so it uses perfomance as "this")
	// otherwise use regular date/time
	return nowFn ?
		function now(){return nowFn.apply(performance);}
		: function now(){ return +new Date();};

});

define('utils/interface/interface',['require','underscore','./listener','../is_touch','./now'],function(require){
	var _ = require('underscore')
		, Listener = require('./listener')
		, is_touch_device = require('../is_touch')
		, now = require('./now');


	/*
	 * adds and removes listeners from the stack
	 *
	 * function add(definitions): add listener, see ./binder.js for more details and options
	 *
	 * definitions = {
	 *		handle: 'listener name',
	 *		on: listener type (click, keypressed, various shortcuts)
	 * }
	 *
	 */

	var listenerStack = [] // holds all active listeners
		, baseTime = 0;

	return {
		// get latency (time since last reset)
		getLatency: function(){
			return now() - baseTime;
		},

		// reset timer
		resetTimer: function(){
			baseTime = now();
		},

		// add listeners
		add: function(definitions){
			if (!definitions){
				throw new Error('Missing input element. Could not add input listener');
			}

			var interfaceObj = this;
			// make sure definitions is set as an array
			var definitionsArr = _.isArray(definitions) ? definitions : [definitions];

			// for each definitions object create a listener
			_.forEach(definitionsArr,function(definition){
				// if this listener is targeted specificaly at a touch\!touch device
				if (!_.isUndefined(definition.touch)) {
					// if needed, skip this listener
					if (is_touch_device && !definition.touch) {
						return true;
					}
					if (!is_touch_device && definition.touch) {
						return true;
					}
				}

				var listener = new Listener(definition, interfaceObj);
				listenerStack.push(listener);
			});

		},

		// remove listeners
		remove: function(handleList){
			handleList = _.isArray(handleList ) ? handleList  : [handleList ];

			// go through the listener stack and remove any listeners that fit the handle list
			// note that we do this in reverse so that the index does not change
			for (var i = listenerStack.length - 1; i >= 0 ; i--){
				var listener = listenerStack[i];
				if (_.indexOf(handleList,listener.handle) != -1){
					listener.off();
					listenerStack.splice(i,1);
				}
			}
		},

		// remove all listeners
		destroy: function(){
			// destroy each listener
			_.invoke(listenerStack,'destroy');

			// empty stack
			listenerStack = [];
		}
	};
});
define('models/model',['require','underscore','backbone'],function(require) {
	var _ = require('underscore')
		, Backbone = require('backbone');

	// ***********  prototypal inheritance  ***********
	// use example: newObject = Object.create(oldObject);
	// @todo: do we realy need this?
	if (typeof Object.create !== 'function') {
		Object.create = function (o) {
			function F() {}
			F.prototype = o;
			return new F();
		};
	}


	var Model = Backbone.Model.extend({

		constructor : function ( attributes, options ) {
			var new_attributes = {};

			// clone attributes so that we prototipicaly inherit objects
			_.each(attributes, function(value, key){

				if (_.isObject(value)) {
					// inherit object
					var child = Object.create(value);

					// default to the default properties of the model
					var defaultObj = this.defaults && this.defaults[key] && _.isObject(this.defaults[key]) ? this.defaults[key] : {};
					new_attributes[key] = _.defaults(child, defaultObj);
				} else {
					new_attributes[key] = value;
				}
			},this);

			// Note that __super__ is not part of the documented API, but
			// it seems to me that a lot of actual Backbone behavior is not
			// documented, and since __super__ is there, so far I've been
			// using it instead of setting my own property to store the
			// reference to the parent class.

			Backbone.Model.apply(this, [new_attributes, options]);

		}

	});

	// Returns the Model class
	return Model;
});
/*
 * the media view
 *
 */

define('app/media/media_view',['require','backbone','underscore','app/task/main_view'],function(require){
    var Backbone = require('backbone'),
        _ = require('underscore'),
        main_view = require('app/task/main_view');

    var canvas = main_view.$el;

    var View = Backbone.View.extend({

        // build element according to simulus
        initialize: function(options){
            this.options = options || {}; // needed since backbone v1.1.0

            this.$el
                .addClass('stimulus')
                .attr('data-handle', this.model.handle)     // add data-handle for handeling of mouse/touch interactions
                .css("visibility", "hidden")
                .css(this.model.get('css'))
                .appendTo(canvas);

            this.render();
        },

        // we keep all stimuli appended to the canvas so that the render function can apply to them
        // they shouldn't affect each other because they have absolute positioning
        // we hide and show them using visibility

        render: function(){
            // these are the things that need recalibrating on refresh
            this.size();

            // if the element does not have a width it is meaningless to place it at this stage
            if (this.$el.width()){
                this.place();
            } else {
                // this is probably an image that hasn't been loaded yet
                // we need to defer "place" because safari needs time to load images
                // the preloader makes sure that the image is already in cache
                // but it appears that safari requires another round of the call stack before loading the image...
                _.defer(_.bind(this.place, this));
            }

            return this;
        },

        show: function(){
            // if this is a gif, reload it before displaying so that the gif is reset
            if (this.options.type === 'image' && this.options.image.indexOf('gif') !== -1){
                // weird IE bug that prevents refreshing gifs...
				// also, on IE11 you can't refresh a gif when it is not visibility:visible
                if(window.ActiveXObject || "ActiveXObject" in window){ // true only in IE
                    this.$el.css("visibility", "visible");
					this.$el[0].src =  this.options.image + '#' + Math.random();
                } else {
                    // Firefox requires to explicitly empty the "src" before resetting it.
                    this.$el[0].src = "";
                    this.$el[0].src = this.options.image;
					this.$el.css("visibility", "visible");
                }

				return this;
            }

            this.$el.css("visibility", "visible");
            return this;
        },

        hide: function(){
            this.$el.css("visibility", "hidden");
            return this;
        },

        size: function(){
            var size = this.model.get('size');

            if (size.font_size){
                this.$el.css('font-size', size.font_size);
            }
            // if this is a word, we don't want to set height (it breaks centering)
            if (size.height != 'auto' && this.options.type != 'word') {
                this.$el.height(size.height + '%');
            }
            if (size.width != 'auto'){
                this.$el.width(size.width + '%');
            }

            return this;
        },

        // places the element on the canvas (has to be called after size)
        // @TODO: this is way too complex to be left here, we should probably export this to a seperate file or something
        place: function(){
            // helper function: returns sizes of element;
            function size($elem){
                return {
                    height    : $elem.outerHeight(),
                    width    : $elem.outerWidth()
                };
            }

            var top, bottom, left, right; // will hold the offset for the locations
            var canvasSize = size(canvas);
            var elSize = size(this.$el);
            // get location setting and set center as default
            var location = this.model.get('location') || {};
            if (typeof location.top == 'undefined' && typeof location.bottom == 'undefined') {
                location.top = 'center';
            }
            if (typeof location.left == 'undefined' && typeof location.right == 'undefined') {
                location.right = 'center';
            }

            // set offsets:
            switch (location.top){
                case undefined :
                    /* falls through */
                case 'auto'     : top = 'auto'; break;
                case 'center'    : top = (canvasSize.height - elSize.height)/2; break;
                default            : top = (canvasSize.height * location.top)/100;
            }

            switch (location.bottom){
                case undefined :
                    /* falls through */
                case 'auto'     : bottom = 'auto'; break;
                case 'center'    : bottom = (canvasSize.height - elSize.height)/2; break;
                default            : bottom = (canvasSize.height * (location.bottom))/100;
            }

            switch (location.left){
                case undefined :
                    /* falls through */
                case 'auto'     : left = 'auto'; break;
                case 'center'    : left = (canvasSize.width - elSize.width)/2; break;
                default            : left = (canvasSize.width * location.left)/100;
            }

            switch (location.right){
                case undefined :
                    /* falls through */
                case 'auto'     : right = 'auto'; break;
                case 'center'    : right = (canvasSize.width - elSize.width)/2; break;
                default            : right = (canvasSize.width * (location.right))/100;
            }

            this.$el.css({
                top     : top,
                bottom    : bottom,
                left     : left,
                right     : right
            });
        }

    });

    // Returns the View Constructor
    return View;
});

/*
 * a function that takes a media object and creates appropriate html for it
 *
 * html(media, context)
 *		takes a media object such as {word: 'Morning'} (we do our best for the object to have only one property)
 *		the context is the object used for templating
 */
define('utils/html',['require','jquery','utils/preloader'],function(require) {
	var $ = require('jquery')
		,  preload = require('utils/preloader');

	function html(media){
		// all templateing is done within the inflate trial function and the sequencer
		var template = media.html || media.inlineTemplate || media.template; // give inline template precedence over template, because tempaltes are loaded into inlinetemplate

		if (media.word) {
			media.displayType = 'element';
			media.type = 'word';
			media.el = $('<div>',{text:media.word});
		}
		else if (media.image) {
			media.displayType = 'element';
			media.type = 'image';
			media.el = preload.getImage(media.image);
		}
		else if (media.jquery) {
			media.displayType = 'element';
			media.type = 'jquery';
			media.el = media.jquery;
		}
		else if (template) { // html | template | inlineTemplate
			media.displayType = 'element';
			media.type = 'html';
			try {
				media.el = $(template);
			} catch (e) {
				throw new Error('HTML must be wrapped in an html element such as <span></span>. ' + template + ' is invalid');
			}
		} else {
			return false; // this is not a supported html type
		}
	}

	return html;

});

define('app/global',['require','underscore'],function(require){

	// initiate piGloabl
	window.piGlobal || (window.piGlobal = {});

	var _ = require('underscore');
	var glob = window.piGlobal;


	/**
	 * getter setter for the global object
	 * @param  {Object} obj     The object to add to the global
	 * @param  {Bool} 	replace A new object to fully replace the old global
	 * @return {Object}         The full global
	 */
	function global(obj, replace){

		if (replace) {
			glob = obj;
			return glob;
		}

		if (_.isPlainObject(obj)){
			_.each(function(value, key){
				console.warn && global[key] && console.warn('Overwriting "' + key  + '" in global object.');
			});
			_.merge(glob, obj);
		}

		return glob;
	}

	return global;
});
define('app/media/media_constructor',['require','underscore','./media_view','utils/html','app/global'],function(require) {
	var _ = require('underscore')
		, MediaView = require('./media_view')
		,html = require('utils/html')
		,global = require('app/global');

	function Media(source, model){

		// make sure we have a media object
		if (!source){
			throw new Error('Media object not defined for ' + model.name());
		}

		// keep the source
		source.source = _.cloneDeep(source);

		// keep a reference to the model
		source.model = model;

		html(source,{
			global: global(),
			trialData: model.trial.data,
			stimulusData: model.get('data')
		});

		// return a new media view
		return new MediaView(source);
	}

	return Media;
});


define('app/stimulus/stimulus_model',['require','models/model','app/media/media_constructor','utils/pubsub','underscore','utils/is_touch','app/task/settings'],function(require) {
	var MyModel = require("models/model")
		,MediaView = require("app/media/media_constructor")
		,pubsub = require("utils/pubsub")
		,_ = require("underscore")
		,is_touch = require("utils/is_touch")
		,settings = require("app/task/settings");


	var Model = MyModel.extend({
		initialize: function(){
			// set trial in the model
			if (this.collection.trial) {
				this.trial = this.collection.trial;
			}

			// set model handle
			this.attributes.data = this.attributes.data || {}; // make sure we have a data object
			this.attributes.data.handle = this.attributes.data.handle || this.attributes.handle; // set the handle in the data object
			this.handle =  this.attributes.data.handle; // set the handle in the stimulus object

			// pick the correct media according to if this is a touch device
			var mediaSource = is_touch && this.get('touchMedia') ? this.get('touchMedia') : this.get('media');

			// take the media source and build it into a full fledged view
			this.media = new MediaView(mediaSource,this);

		},

		// Default values for all of the attributes
		defaults: {
			size: {height: 'auto', width: 'auto'},
			css:{}
		},


		// activate stimulus listeners (maybe these shoud sit in one of the trial modules? call with apply)
		// ----------------------------------------------------------------------------------------------------------

		activate: function(){
			var self = this;
			var stimHandle = this.handle;
			this.timeStack = this.timeStack || [];
			this.pubsubStack = this.pubsubStack || [];

			// subscribe to start action
			// -------------------------
			pubsub.subscribe('stim:start', self.pubsubStack, function(handle){
				if (!_.include([stimHandle,'All'], handle)) {
					// make sure this publication is aimed at us
					return false;
				}

				// present the stimulus
				self.media.show();
			});

			// subscribe to set attribute action
			// ---------------------------------

			pubsub.subscribe('stim:setAttr', self.pubsubStack, function(handle,setter){
				if (!_.include([stimHandle,'All'], handle)) {
					// make sure this publication is aimed at us
					return false;
				}

				// if this is a function let it do whatever it wants with this model, otherwise simply call set.
				if (_.isFunction(setter)) {
					setter.apply(self);
				} else {
					var data = self.get('data') || {};
					data = _.extend(data, setter);
					self.set('data', data);
				}
			});

			// subscribe to stop stimulus action
			// ---------------------------------
			pubsub.subscribe('stim:stop', self.pubsubStack, function(handle){
				if (!_.include([stimHandle,'All'], handle)) {
					// make sure this publication is aimed at us
					return false;
				}

				// hide the stimulus
				self.media.hide();
			});
		},

		disable: function(){
			// hide the stimulus
			this.media.hide();

			// make sure the stacks exist
			this.timeStack = this.timeStack || [];
			this.pubsubStack = this.pubsubStack || [];

			_.each(this.pubsubStack, function(handle) {
				pubsub.unsubscribe(handle);
			});

			// empty stacks
			this.timeStack = [];
			this.pubsubStack = [];
		},

		name: function(){
			var attr = this.attributes;
			if (attr.data.alias) {return attr.data.alias;} // if we have an alias ues it
			if (attr.inherit && attr.inherit.set) {return attr.inherit.set;} // otherwise try using the set we inherited from
			if (attr.handle) {return attr.handle;} // otherwise use handle
			return 'Anonymous Stimulus'; // we're out of options here
		},

		mediaName: function(){
			var media = this.media.options;
			var fullpath = settings.logger && settings.logger.fullpath; // should we use the full path or just the file name
			if (media.alias) {return media.alias;} // if we have an alias ues it
			for (var prop in media) {
				if (_.contains(['image','template'],prop)) {
                    return fullpath ? media[prop] : media[prop].replace(/^.*[\\\/]/, '');
				}
				if (_.contains(['word','html','inlineTemplate'],prop) && media[prop]) { // sometimes we have an empty value (this happens when we load a template and then translate it into an inline template)
                    return media[prop];
				}
			}
		}

	});

	// Returns the Model class
	return Model;

});
define('app/stimulus/stimulus_constructor',['require','./stimulus_model'],function(require){
	var Stim_model = require('./stimulus_model');

	return function Stimulus_constructor(source, options){

		var data = source;
		// keep source for later use
		// @TODO probably depracated
		data.source = source;

		return new Stim_model(data, options);
	};

});
define('app/stimulus/stimulus_collection',['require','underscore','backbone','app/stimulus/stimulus_constructor'],function(require){
	var _ = require('underscore')
		, Backbone = require('backbone')
		, stimModel = require('app/stimulus/stimulus_constructor');

	var Collection = Backbone.Collection.extend({
		model:stimModel,

		initialize: function(models,options){
			options || (options = {});

			// set trial in the collection
			this.trial = options.trial;
		},

		// similar to the collection function where, only searches the data attribute
		whereData: function(attrs) {

			if (_.isEmpty(attrs)) {
				return [];
			}
			return this.filter(function(model) {
				var data = model.get('data') || {};

			for (var key in attrs) {
				if (attrs[key] !== data[key]) {
                    return false;
                }
			}
			return true;
			});
		},

		activate: function(){
			this.each(function(stimulus){
				stimulus.activate();
			});
			return this;
		},

		disable: function(){
			this.each(function(stimulus){
				stimulus.disable();
			});
			return this;
		},

		display_all: function(){
			this.each(function(stimulus){
				stimulus.media.show();
			});
		},

		hide_all: function(){
			this.each(function(stimulus){
				stimulus.media.hide();
			});
		},

		refresh: function(){
			this.each(function(stimulus){
				stimulus.media.render();
			});
		},

		get_stimlist: function(){
			return this
				.chain()
				.filter(function(stimulus){return !stimulus.get('nolog');})
				.map(function(stimulus,index){
					return stimulus.name() || ('stim' + index);
				})
				.value();
		},

		get_medialist: function(){
			return this
				.chain()
				.filter(function(stimulus){return !stimulus.get('nolog');})
				.map(function(stimulus,index){
					return stimulus.mediaName() || ('media' + index);
				})
				.value();
		}

	});

	// Returns the Collection class
	return Collection;

});
/*
 * gets a condition array (or a single condition) and evaluates it
 * returns true if all statements are true, false otherwise
 *
 * a single condition looks like this:
 *
 *	condition = {
 *		type : 'begin/inputEquals/inputEqualsTrial/inputEqualsStim/function',
 *		value: 'right/trialAttribute/stimAttribute/customFunction',
 *		handle: 'stim handle' (optional in case we're targeting a stimulus)
 *	}
 *
 */

define('app/trial/evaluate',['require','underscore','app/global','./current_trial'],function(require){

	var _ = require('underscore')
		, globalGetter = require('app/global')
		, current_trial = require('./current_trial');


	return function evaluate(conditions, inputData){

		var global = globalGetter();
		var current = global.current || {};
		var trial = current_trial();

		if (!conditions){
			throw new Error("There is an interaction without conditions!!");
		}

		// make sure conditions is an array
		conditions = _.isArray(conditions) ? conditions : [conditions];

		// the internal event
		inputData = inputData || {};

		// assume condition is true
		var isTrue = true;

		// if this is a begin event, make sure we only run conditions that have begin in them
		if (inputData.type == 'begin') {
			// check if this set of conditions has 'begin' in it
			var has_begin = _.reduce(conditions, function(memo, row){return memo || row.type == 'begin';},false);
			if (!has_begin){
				return false;
			}
		}

		// try to refute the condition
		_.each(conditions,function(condition){
			var searchObj, result;
			var evaluation = true;
			switch (condition.type){
				case 'begin':
					if (inputData.type !== 'begin') {
						evaluation = false;
					}
					break;

				case 'inputEquals' :
					// make sure condition.value is an array
					_.isArray(condition.value) || (condition.value = [condition.value]);

					if (_.indexOf(condition.value,inputData.handle) === -1) {
						evaluation = false;
					}
					break;

				case 'inputEqualsTrial':
					if (inputData.handle !== trial.data[condition.property]) {
						evaluation = false;
					}
					break;

				case 'inputEqualsStim':
					// create search object
					searchObj = {};
					if (condition.handle){
						searchObj['handle'] = condition.handle;
					}
					searchObj[condition.property] = inputData.handle;

					// are there stimuli answering this descriptions?
					result = trial._stimulus_collection.whereData(searchObj);
					if (result.length === 0) {
						evaluation = false;
					}
					break;

				case 'trialEquals':
					if (typeof condition.property == 'undefined' || typeof condition.value == 'undefined'){
						throw new Error('trialEquals requires both "property" and "value" to be defined');
					}
					if (condition.value !== trial.data[condition.property]){
						evaluation = false;
					}
					break;

				case 'inputEqualsGlobal':
					if (typeof condition.property == 'undefined'){
						throw new Error('inputEqualsGlobal requires "property" to be defined');
					}
					if (inputData.handle !== global[condition.property]){
						evaluation = false;
					}
					break;

				case 'globalEquals':
					if (typeof condition.property == 'undefined' || typeof condition.value == 'undefined'){
						throw new Error('globalEquals requires both "property" and "value" to be defined');
					}
					if (condition.value !== global[condition.property]){
						evaluation = false;
					}
					break;

				case 'globalEqualsTrial':
					if (typeof condition.globalProp == 'undefined' || typeof condition.trialProp == 'undefined'){
						throw new Error('globalEqualsTrial requires both "globalProp" and "trialProp" to be defined');
					}
					if (global[condition.globalProp] !== trial.data[condition.trialProp]) {
						evaluation = false;
					}
					break;

				case 'globalEqualsStim':
					if (typeof condition.globalProp == 'undefined' || typeof condition.stimProp == 'undefined'){
						throw new Error('globalEqualsStim requires both "globalProp" and "stimProp" to be defined');
					}

					// create search object
					searchObj = {};
					if (condition.handle){
						searchObj['handle'] = condition.handle;
					}
					searchObj[condition.stimProp] = global[condition.globalProp];

					// are there stimuli answering this descriptions?
					result = trial._stimulus_collection.whereData(searchObj);
					if (result.length === 0) {
						evaluation = false;
					}
					break;

				case 'inputEqualsCurrent':
					if (typeof condition.property == 'undefined'){
						throw new Error('inputEqualsCurrent requires "property" to be defined');
					}
					if (inputData.handle !== current[condition.property]){
						evaluation = false;
					}
					break;

				case 'currentEquals':
					if (typeof condition.property == 'undefined' || typeof condition.value == 'undefined'){
						throw new Error('currentEquals requires both "property" and "value" to be defined');
					}
					if (condition.value !== current[condition.property]){
						evaluation = false;
					}
					break;

				case 'currentEqualsTrial':
					if (typeof condition.currentProp == 'undefined' || typeof condition.trialProp == 'undefined'){
						throw new Error('currentEqualsTrial requires both "currentProp" and "trialProp" to be defined');
					}
					if (current[condition.currentProp] !== trial.data[condition.trialProp]) {
						evaluation = false;
					}
					break;

				case 'currentEqualsStim':
					if (typeof condition.currentProp == 'undefined' || typeof condition.stimProp == 'undefined'){
						throw new Error('currentEqualsStim requires both "currentProp" and "stimProp" to be defined');
					}

					// create search object
					searchObj = {};
					if (condition.handle){
						searchObj['handle'] = condition.handle;
					}
					searchObj[condition.stimProp] = current[condition.currentProp];

					// are there stimuli answering this descriptions?
					result = trial._stimulus_collection.whereData(searchObj);
					if (result.length === 0) {
						evaluation = false;
					}
					break;

				case 'function' :
					if (!condition.value.apply(trial,[trial,inputData])) {
						evaluation = false;
					}
					break;

				default:
					throw new Error('Unknown condition type: ' + condition.type);
			}

			isTrue = isTrue && (condition.negate ? !evaluation : evaluation);
		});

		return isTrue;
	};
});
define('app/trial/action_list',['require','underscore','utils/pubsub','utils/interface/interface','app/global','app/task/main_view','app/task/canvasConstructor','app/trial/current_trial'],function(require){

	var _ = require('underscore')
		, pubsub = require('utils/pubsub')
		, input = require('utils/interface/interface')
		, global = require('app/global');

 	var actions = {
		/*
		 * Stimulus actions
		 *
		 */

		showStim: function(options){
			var handle = options.handle || options;
			pubsub.publish('stim:start',[handle]);
		},

		hideStim: function(options){
			var handle = options.handle || options;
			pubsub.publish('stim:stop',[handle]);
		},

		setStimAttr: function(options){
			var handle = options.handle;
			var setter = options.setter;
			pubsub.publish('stim:setAttr',[handle,setter]);
		},

		/*
		 * Trial actions
		 */

		setTrialAttr: function(options, eventData){
			if (typeof options.setter == 'undefined') {
				throw new Error('The setTrialAttr action requires a setter property');
			}
			pubsub.publish('trial:setAttr',[options.setter, eventData]);
		},

		setInput: function(options){
			if (typeof options.input == 'undefined') {
				throw new Error('The setInput action requires an input property');
			}
			pubsub.publish('trial:setInput',[options.input]);
		},

		trigger: function(options){
			if (typeof options.handle == 'undefined') {
				throw new Error('The trigger action requires a handle property');
			}
			pubsub.publish('trial:setInput',[{handle:options.handle,on:'timeout',duration:+options.duration || 0}]);
		},

		removeInput: function(options){
			if (typeof options.handle == 'undefined') {
				throw new Error('The removeInput action requires a handle property');
			}
			pubsub.publish('trial:removeInput',[options.handle]);
		},

		// we use es3 true to protect from trailing commas in IE7. Here jshint thinks goto is a reserved word.
		/* jshint es3:false */
		goto: function(options){
		/* jshint es3:true */

			pubsub.publish('trial:goto',[options]);
		},

		endTrial: function(){
			pubsub.publish('trial:end');
		},

		resetTimer: function(options,eventData){
			// set current evenData to 0
			eventData.latency = 0;
			// reset the global timer
			input.resetTimer();
		},

		/*
		 * Logger
		 */

		log: function(options,eventData){
			pubsub.publish('log',[options,eventData]);
		},

		/*
		 * Misc
		 */

		setGlobalAttr: function(options){
			switch (typeof options.setter){
				case 'function':
					options.setter.apply(null,[global(), options]);
					break;
				case 'object':
					_.extend(global(), options.setter);
					break;
				default:
					throw new Error('setGlobalAttr requires a "setter" property');
			}
		},

		custom: function(options,eventData){
			if (typeof options.fn != 'function') {
				throw new Error('The custom action requires a fn propery');
			}
			options.fn.apply(null, [options,eventData,global()]);
		},

		canvas: function(options){
			var $canvas = require('app/task/main_view').$el;
			var canvas = require('app/task/canvasConstructor');
			var trial = require('app/trial/current_trial')();
			var map = {
				background 			: {element: $('body'), property: 'backgroundColor'},
				canvasBackground	: {element: $canvas, property:'backgroundColor'},
				borderColor			: {element: $canvas, property:'borderColor'},
				borderWidth			: {element: $canvas, property:'borderWidth'}
			};

			// settings activator
			var off = canvas(map, _.pick(options,['background','canvasBackground','borderColor','borderWidth']));
			trial.deferred.promise().always(off);
		}

	};

	return actions;
});
define('app/trial/action',['require','underscore','./action_list'],function(require){
	/*
	 * accepts an array of actions (or a single action)
	 * and applies them
	 *
	 * actions = [
	 *		{type:actionName,more:options},
	 *		{actionName:options}
	 * ]
	 * @param actions: single action object or array of action objects
	 * @param eventData: eventData object
	 * @returns Boolean continueActions: whether this action stops further action activations
	 */

	var _ = require('underscore')
		, action_list = require('./action_list');

	function applyActions(actions,eventData){
		// marks whether this is the final action to take
		var continueActions = true;

		if (!actions){
			throw new Error("There is an interaction without actions!!");
		}

		actions = _.isArray(actions) ? actions : [actions];

		_.forEach(actions,function(action){
			var actionFn = action_list[action.type];
			if (action) {
				// currently the only reason to halt action activation is the endTrial command
				if (action.type === 'endTrial'){
					continueActions = false;
				}
				actionFn(action, eventData);
			} else {
				throw new Error('unknown action: ' + action.type);
			}
		});

		return continueActions;
	}

	return applyActions;
});

define('app/trial/interactions',['require','jquery','utils/pubsub','./evaluate','./action'],function(require){
	/*
	 * Organizer for the interaction function
	 * Allows to subscribe and unsubscribe
	 *
	 */

	var $ = require('jquery')
		, pubsub = require('utils/pubsub')
		, evaluate = require('./evaluate')
		, activate = require('./action');

	var subscriptionStack = [];

	var interact = function(interactions,input_data){
		$.each(interactions,function(key,row){
			if (evaluate(row.conditions,input_data)) {
				// if this action includes endTrial we want to stop evalutation
				// otherwise we might evaluate using data from the next trial by accident...
				return activate(row.actions,input_data);
			}
		});
	};

	return {
		activate : function(interactions){
			// subscribe to input and interact with each input
			pubsub.subscribe('input',subscriptionStack,function(input_data){
				interact(interactions,input_data);
			});

			// start by checking for "begin" actions (must be after subscribing!)
			interact(interactions,{type:'begin', latency:0});
		},
		disable : function(){
			// unsubscribe from all interactions
			$.each(subscriptionStack,function(){
				pubsub.unsubscribe(this);
			});
		}
	};
});

define('app/trial/trial_constructor',['require','jquery','underscore','utils/pubsub','utils/interface/interface','app/stimulus/stimulus_collection','./interactions','./current_trial','app/task/main_view'],function(require){

	var $ = require('jquery');
	var _ = require('underscore');
	var pubsub = require('utils/pubsub');
	var input = require('utils/interface/interface');
	var Stimuli = require('app/stimulus/stimulus_collection');
	var interactions = require('./interactions');
	var global_trial = require('./current_trial');
	var main = require('app/task/main_view');
	var counter = 0;

	// data is already fully inflated
	function Trial(source){
		// make sure we always have a data container
		this.data || (this.data = source.data || {});

		// keep source for later use
		this._source = source;

		// create a uniqueId for this trial
		this._id = _.uniqueId('trial_');
		this.counter = counter++;

		// make sure we have all our stuff :)
		//if (!this.input) throw new Error('Input module not defined');
		if (!source.interactions) {
			throw new Error('Interactions not defined');
		}

		// add layout stimuli
		this._layout_collection = new Stimuli(arrayWrap(source.layout),{trial:this});

		// add main stimuli
		this._stimulus_collection = new Stimuli(arrayWrap(source.stimuli),{trial:this});

		// subscription stack
		this._pubsubStack = [];

		// the next trial we want to play
		// by default this is simply the next trial, this can be changed using the goto action
		// the syntax is [destination, properties]
		this._next = ['next',{}];

		// the trial deferred (used to follow when the trial ends)
		this.deferred = $.Deferred();
	}

	_.extend(Trial.prototype,{

		activate: function(){

			var self = this;

			// set global trial
			global_trial(this);

			// display layout elements
			this._layout_collection.display_all();

			// subscribe to end trial
			pubsub.subscribe("trial:end",this._pubsubStack,_.bind(this.deactivate,this));

			// subscribe to set attribute
			pubsub.subscribe("trial:setAttr",this._pubsubStack,function(setter,eventData){
				if (_.isFunction(setter)) {
					setter.apply(self, [self.data,eventData]);
				} else {
					_.extend(self.data,setter);
				}
			});

			// subscribe to set input
			pubsub.subscribe("trial:setInput",this._pubsubStack,function(inputData){
				input.add(inputData);
			});

			// subscribe to remove input
			pubsub.subscribe("trial:removeInput",this._pubsubStack,function(handleList){
				if (handleList == 'All' || _.include(handleList,'All')){
					input.destroy();
				} else {
					input.remove(handleList);
				}
			});

			// subscribe to goto
			pubsub.subscribe("trial:goto",this._pubsubStack,function(options){
				self._next = [options.destination, options.properties || {}];
			});

			// activate input
			input.add(arrayWrap(this._source.input));

			// activate stimuli
			this._stimulus_collection.activate();

			// reset the interface timer so that event latencies are relative to now.
			input.resetTimer();

			// listen for interaction
			interactions.activate(this._source.interactions);

			// return the trial deferred
			return this.deferred.promise();
		},

		deactivate: function(){
			var self = this;

			// cancel all listeners
			input.destroy();

			// disable active stimuli
			this._stimulus_collection.disable();

			// stop interaction listeners
			interactions.disable();

			// unsubscribe
			_.each(this._pubsubStack, function(handle) {
				pubsub.unsubscribe(handle);
			});
			this._pubsubStack = [];

			// unset global trial
			global_trial(undefined);

			// IE7 or lower
			// @todo: improve very ugly solution to ie7 bug, we need the no timeout solution for ipad where this causes a blink
			if (document.all && !document.addEventListener) {
				// resolve this trial (inside timeout, to make sure the endtrial subscription ends. ie7 bug)
				setTimeout(function(){
					// remove all stimuli from canvas (needs to be inside timeout to prevent blink in some browsers)
					main.empty();
					self.deferred.resolve(self._next[0], self._next[1]);

				},1);
			} else {
				// regular resolve (let the deferred know were we are going next)
				main.empty();
				self.deferred.resolve(self._next[0], self._next[1]);
			}
		},

		name: function(){
			// if we have an alias ues it
			if (this.data.alias) {
				return this.data.alias;
			}
			// otherwise try using the set we inherited from
			if (_.isString(this._source.inherit)){
				return this._source.inherit;
			}
			if (_.isPlainObject(this._source.inherit)){
				return this._source.inherit.set;
			}
			return false; // we're out of options here
		}
	});

	function arrayWrap(arr){
		if (!arr){return [];}
		return _.isArray(arr) ? arr : [arr];
	}

	return Trial;
});
/*
 * Send log chunk
 * returns a function that takes data and sends it to the server after appending any meta data
 */
define('app/task/log/post',['require','jquery','app/task/settings'],function(require){
	var $ = require('jquery')
		, settingsGetter = require('app/task/settings');

	function send(data){
		var settings = settingsGetter();
		var url = settings.logger && settings.logger.url
			, deff = $.Deferred();

		if (!url) {
			return deff.resolve();
		}

		// build post data
		var post = {
			json: JSON.stringify(data) || ""
		};
		$.extend(post, settings.metaData || {});

		// lets post our data
		deff = $.post(url,post);

		// now, if there was a failure, lets try to resend
		deff = deff.then(null,function(){
			return $.post(url,post);
		});

		return deff;
	}

	return send;
});


/*
 * Holds the logged rows in serial order
 */
define('app/task/log/log_stack',['require','app/global'],function(require){
	var global = require('app/global');

	return function(){
		return global().current.logs;
	};
});
/*
 * activate logger
 * note that we are loading modules into the global object here (json2)
 */
define('app/task/log/logger',['require','jquery','utils/pubsub','app/trial/current_trial','app/task/settings','./post','./log_stack'],function(require){

	var $ = require('jquery')
		, pubsub = require('utils/pubsub')
		, trial = require('app/trial/current_trial')
		, settings = require('app/task/settings')
		, post = require('./post')
		, logStackGetter = require('./log_stack');

	// counter for the last time we sent (it holds the last length for which we sent)
	var lastSend = 0;
	var postDef = $.Deferred().resolve(); // a defered to follow all posting

	function defaultLogger(trialData, inputData, actionData,logStack){

		var stimList = this._stimulus_collection.get_stimlist();
		var mediaList = this._stimulus_collection.get_medialist();

		return {
			log_serial : logStack.length,
			trial_id: this.counter,
			name: this.name(),
			responseHandle: inputData.handle,
			latency: Math.floor(inputData.latency),
			stimuli: stimList,
			media: mediaList,
			data: trialData
		};
	}

	/*
	 * Send all logs since lastSend
	 * @returns $.Deferred
	 */
	function sendChunk(){
		var logChunk; // the log chunk we want to send right now
		var logStack = logStackGetter();

		// if  we've already sent everything,  we don't need to do anything
		if (logStack.length - lastSend <= 0) {
			return postDef;
		} else {
			// get the log chunk that we want to send
			logChunk =  logStack.slice(lastSend, logStack.length);

			// reset lastSend counter
			lastSend = logStack.length;
			return $.when(postDef, post(logChunk));
		}
	}

	/*
	 * create log row and push it into log stack
	 */
	pubsub.subscribe('log',function(options, input_data){
		var logStack = logStackGetter();
		// get settings
		var logger = settings().logger || {};
		// get the logger function
		var callback = logger.logger ? logger.logger : defaultLogger;

		// add row to log stack
		var trialObj = trial();
		var row = callback.apply(trialObj,[trialObj.data, input_data, options,logStack]);

		if (logger.meta){
			if ($.isPlainObject(logger.meta)){
				$.extend(row, logger.meta);
			} else {
				throw new Error ('LOGGER: logger.meta must be an object but instead was a ' + typeof logger.meta);
			}
		}

		logStack.push(row);
	});

	/*
	 * send logStack to server, but only if it is full
	 * The end task send is activated directly using the send function
	 */
	pubsub.subscribe('log:send',function(){
		var logStack = logStackGetter();
		// get pulse size
		var pulse = settings().logger && settings().logger.pulse;

		// if logStack is full, lets send it
		if (pulse && logStack.length - lastSend >= pulse) {
			sendChunk();
		}
	});

	return sendChunk;
});
define('app/sequencer/inflateTrial',['require','underscore','../global','./taskSequence','./database','../task/build_url'],function(require){

	var _ 					= require('underscore');
	var globalGetter 		= require('../global');
	var sequenceGetter		= require('./taskSequence');
	var db 					= require('./database');
	var buildUrl 			= require('../task/build_url');

	function inflateTrial(destination, properties){
		var sequence = sequenceGetter();
		var global = globalGetter();
		var context = {global: global, current: global.current};
		var source;

		sequence.go(destination, properties, context);
		source = sequence.current(context, {skip:['layout','stimuli']});

		if (!source){
			return;
		}

		source.stimuli = _.map(source.stimuli || [], buildStim, context);
		source.layout = _.map(source.layout || [], buildStim, context);

		context.trialData = null;
		return source;
	}

	return inflateTrial;

	function buildMedia(stim, prop, context){
		var val = stim[prop];

		if (!val) {
			return false;
		}

		if (_.isString(val)){
			stim[prop] = val = {word: val};
		}

		val = db.inflate('media', val, context);

		// note that the base url is added to the media object during the sequence preload
		// if needed, build url
		if (val.image){
			val.image = buildUrl(val.image,'image');
		}

		if (val.template){
			val.inlineTemplate = requirejs('text!' + buildUrl(val.template, 'template'));
			val.inlineTemplate = _.template(val.inlineTemplate)(context);
		}

		stim[prop] = val;

		context.mediaData = null;
		context.mediaMeta = null;
	}

	function buildStim(stim){
		var context = this;

		stim = db.inflate('stimulus', stim, context, {skip:['media','touchMedia']});
		buildMedia(stim, 'media', context);
		buildMedia(stim, 'touchMedia', context);
		context.stimulusData = null;
		context.stimulusMeta = null;
		return stim;
	}
});
define('app/sequencer/player',['require','jquery','app/trial/trial_constructor','app/task/log/logger','app/task/settings','utils/pubsub','app/task/main_view','./inflateTrial'],function(require){

	var $					= require('jquery')
		, Trial				= require('app/trial/trial_constructor')
		, logger			= require('app/task/log/logger')
		, settingsGetter	= require('app/task/settings')
		, pubsub			= require('utils/pubsub')
		, main 				= require('app/task/main_view')
		, inflateTrial 		= require('./inflateTrial');


	/*
	 * the function that plays the source sequence
	 */

	// check if we have another trial, if so plays it, if not ends the task
	function nextTrial(destination, properties){

		var source = inflateTrial(destination, properties);
		var trial;

		// if we have another trial play it (next() both returns the next trial and sets it as current)
		if (source) {
			// create new trial and activate it
			trial = new Trial(source);
			trial
				.activate()								// activate the trial
				.done(function(){
					pubsub.publish('log:send');			// see if we need to send the log stack
					nextTrial.apply(null,arguments);	// when we're done try to play the next one (move arguments on to nextTrial)
				});

			// let everyone know that we are ready to go
			pubsub.publish("trial:activated",[trial]);
		} else {
			// @TODO: this realy shouldn't be here. this whole function is responsible for too many things...
			//
			// post any data that hasn't been posted yet.
			// and then proceed to the end task hook or to redirect
			logger()
				.always(function(){
					var hooks = settingsGetter('hooks') || {};
					return $.when(hooks.endTask && hooks.endTask());
				})
				.always(function(){
					main.deferred.resolve();
				});
		}
	}

	return nextTrial;

});

/**
 * Activate pip script
 * @param  {Object} script    The pip script we want to run
 * @param  {?function} done   A function to call once pip is over
 * @return {promise}
 */
define('activatePIP',['require','underscore','app/task/script','app/task/main_view','app/task/parser','app/sequencer/player','app/global'],function (require) {

	var _ = require('underscore'),
		mainScript = require('app/task/script'),
		main = require('app/task/main_view'),
		parse = require('app/task/parser'),
		play = require('app/sequencer/player'),
		global = require('app/global');


	function activate(script, done) {
		// init global
		var glob = global(global());
		var name = script.name || 'anonymous PIP';

		// create local namespace
		glob[name] = glob.current = (_.isPlainObject(script.current) ? script.current : {});
		glob.current.logs || (glob.current.logs = []); // init logs object

		// set the main script as a global
		mainScript(script);

		var parseDef = parse();

		// activate main view and then display the loading screen
		main
			.activate()
			.done(function () {
				main
					.loading(parseDef) // activate loading screen
					.done(function () {
						main.empty(); // remove the loading screen
						play('next', {}); // activate task
					})
					.fail(function (src) {
						throw new Error('loading resource failed, do something about it! (you can start by checking the error log, you are probably reffering to the wrong url - ' + src + ')');
					});
			});

		return main.deferred.promise()
			.then(done || function dfltDone() {
				var redirect = script.settings && script.settings.redirect;
				// window.location.href = redirect || window.location.href;
			});
	}

	return activate;
});
/**
 * IAT5.js extension for PIP
 */

define('iat5',['pipAPI', 'pipScorer', 'underscore'], function (APIConstructor, Scorer, _) {

  /**
  Created by: Yoav Bar-Anan (baranan@gmail.com). Modified by Elad
   * @param  {Object} options Options that replace the defaults...
   * @return {Object}         PIP script
  **/

  function iatExtension(options) {
    var API = new APIConstructor();
    var scorer = new Scorer();
    var piCurrent = API.getCurrent();

    //Here we set the settings of our task. 
    //Read the comments to learn what each parameters means.
    //You can also do that from the outside, with a dedicated jsp file.
    var iatObj =
    {
      istouch: false, //Set whether the task is on a touch device.
      //Set the canvas of the task
      canvas: {
        maxWidth: 725,
        proportions: 0.7,
        background: '#ffffff',
        borderWidth: 5,
        canvasBackground: '#ffffff',
        borderColor: 'lightblue'
      },
      category1: {
        name: 'Black people', //Will appear in the data.
        title: {
          media: { word: 'Black people' }, //Name of the category presented in the task.
          css: { color: '#336600', 'font-size': '1.8em' }, //Style of the category title.
          height: 4 //Used to position the "Or" in the combined block.
        },
        stimulusMedia: [ //Stimuli content as PIP's media objects
          { word: 'Tyron' },
          { word: 'Malik' },
          { word: 'Terrell' },
          { word: 'Jazmin' },
          { word: 'Tiara' },
          { word: 'Shanice' }
        ],
        //Stimulus css (style)
        stimulusCss: { color: '#336600', 'font-size': '2.3em' }
      },
      category2: {
        name: 'White people', //Will appear in the data.
        title: {
          media: { word: 'White people' }, //Name of the category presented in the task.
          css: { color: '#336600', 'font-size': '1.8em' }, //Style of the category title.
          height: 4 //Used to position the "Or" in the combined block.
        },
        stimulusMedia: [ //Stimuli content as PIP's media objects
          { word: 'Jake' },
          { word: 'Connor' },
          { word: 'Bradley' },
          { word: 'Allison' },
          { word: 'Emma' },
          { word: 'Emily' }
        ],
        //Stimulus css
        stimulusCss: { color: '#336600', 'font-size': '2.3em' }
      },
      attribute2:
      {
        name: 'Good words',
        title: {
          media: { word: 'Good words' },
          css: { color: '#0000FF', 'font-size': '1.8em' },
          height: 4 //Used to position the "Or" in the combined block.
        },
        stimulusMedia: [ //Stimuli content as PIP's media objects
          { word: 'laughter' },
          { word: 'happy' },
          { word: 'glorious' },
          { word: 'joy' },
          { word: 'wonderful' },
          { word: 'peace' },
          { word: 'pleasure' },
          { word: 'love' }
        ],
        //Stimulus css
        stimulusCss: { color: '#0000FF', 'font-size': '2.3em' }
      },
      attribute1:
      {
        name: 'Bad words',
        title: {
          media: { word: 'Bad words' },
          css: { color: '#0000FF', 'font-size': '1.8em' },
          height: 4 //Used to position the "Or" in the combined block.
        },
        stimulusMedia: [ //Stimuli content as PIP's media objects
          { word: 'awful' },
          { word: 'failure' },
          { word: 'agony' },
          { word: 'hurt' },
          { word: 'horrible' },
          { word: 'terrible' },
          { word: 'nasty' },
          { word: 'evil' }
        ],
        //Stimulus css
        stimulusCss: { color: '#0000FF', 'font-size': '2.3em' }
      },

      base_url: {//Where are your images at?
        image: '/implicit/user/yba/pipexample/biat/images/'
      },

      nBlocks: 7, //Can be 5 or 7.
      ////In each block, we can include a number of mini-blocks, to reduce repetition of same group/response.
      blockAttributes_nTrials: 20,
      blockAttributes_nMiniBlocks: 5,
      blockCategories_nTrials: 20,
      blockCategories_nMiniBlocks: 5,
      blockFirstCombined_nTrials: 20,
      blockFirstCombined_nMiniBlocks: 5,
      blockSecondCombined_nTrials: 40, //Not used if nBlocks=5.
      blockSecondCombined_nMiniBlocks: 10, //Not used if nBlocks=5.
      blockSwitch_nTrials: 28,
      blockSwitch_nMiniBlocks: 7,

      //Should we randomize which attribute is on the right, and which on the left?
      randomAttSide: false, // Accepts 'true' and 'false'. If false, then attribute2 on the right.

      //Should we randomize which category is on the right first?
      randomBlockOrder: true, //Accepts 'true' and 'false'. If false, then category1 on the left first.
      //Note: the player sends block3Cond at the end of the task (saved in the explicit table) to inform about the categories in that block.
      //In the block3Cond variable: "att1/cat1,att2/cat2" means att1 and cat1 on the left, att2 and cat2 on the right.

      //Show a reminder what to do on error, throughout the task
      remindError: true,

      remindErrorText: '<p align="center" style="font-size:"0.6em"; font-family:arial">' +
        'Si vous faites une erreur, un <font color="#ff0000"><b>X</b></font> rouge apparaîtra. ' +
        'Appuyez sur l\'autre touche pour continuer.<p/>',

      remindErrorTextTouch: '<p align="center" style="font-size:"1.4em"; font-family:arial">' +
        'Si vous faites une erreur, un <font color="#ff0000"><b>X</b></font> rouge apparaîtra. ' +
        'Touchez l\'autre côté pour continuer.<p/>',

      errorCorrection: true, //Should participants correct error responses?
      errorFBDuration: 500, //Duration of error feedback display (relevant only when errorCorrection is false)
      ITIDuration: 250, //Duration between trials.

      fontColor: '#000000', //The default color used for printed messages.

      //Text and style for key instructions displayed about the category labels.
      leftKeyText: 'Press "E" for',
      rightKeyText: 'Press "I" for',
      keysCss: { 'font-size': '0.8em', 'font-family': 'courier', color: '#000000' },
      //Text and style for the separator between the top and bottom category labels.
      orText: 'or',
      orCss: { 'font-size': '1.8em', color: '#000000' },

      instWidth: 99, //The width of the instructions stimulus

      finalText: 'Press space to continue to the next task',
      finalTouchText: 'Touch the bottom green area to continue to the next task',

      touchMaxStimulusWidth: '50%',
      touchMaxStimulusHeight: '50%',
      bottomTouchCss: {}, //Add any CSS value you want for changing the css of the bottom touch area.

      //Instructions text.
      // You can use the following variables and they will be replaced by
      // the name of the categories and the block's number variables:
      // leftCategory, rightCategory, leftAttribute and rightAttribute, blockNum, nBlocks.
      // Notice that this is HTML text.
      instAttributePractice: '<div><p align="center" style="font-size:20px; font-family:arial">' +
        '<font color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' +
        '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' +
        'Put a left finger on the <b>E</b> key for items that belong to the category <font color="#0000ff">leftAttribute.</font>' +
        '<br/>Put a right finger on the <b>I</b> key for items that belong to the category <font color="#0000ff">rightAttribute</font>.<br/><br/>' +
        'If you make a mistake, a red <font color="#ff0000"><b>X</b></font> will appear. ' +
        'Press the other key to continue.<br/>' +
        '<u>Go as fast as you can</u> while being accurate.<br/><br/></p>' +
        '<p align="center">Press the <b>space bar</b> when you are ready to start.</font></p></div>',
      instAttributePracticeTouch: [
        '<div>',
        '<p align="center">',
        '<u>Part blockNum of nBlocks</u>',
        '</p>',
        '<p align="left" style="margin-left:5px">',
        '<br/>',
        'Put a left finger over the the <b>left</b> green area for items that belong to the category <font color="#0000ff">leftAttribute</font>.<br/>',
        'Put a right finger over the <b>right</b> green area for items that belong to the category <font color="#0000ff">rightAttribute</font>.<br/>',
        'Items will appear one at a time.<br/>',
        '<br/>',
        'If you make a mistake, a red <font color="#ff0000"><b>X</b></font> will appear. Touch the other side. <u>Go as fast as you can</u> while being accurate.',
        '</p>',
        '<p align="center">Touch the <b>lower </b> green area to start.</p>',
        '</div>'
      ].join('\n'),

      instCategoriesPractice: '<div><p align="center" style="font-size:20px; font-family:arial">' +
        '<font color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' +
        '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' +
        'Put a left finger on the <b>E</b> key for items that belong to the category <font color="#336600">leftCategory</font>. ' +
        '<br/>Put a right finger on the <b>I</b> key for items that belong to the category <font color="#336600">rightCategory</font>.<br/>' +
        'Items will appear one at a time.<br/><br/>' +
        'If you make a mistake, a red <font color="#ff0000"><b>X</b></font> will appear. ' +
        'Press the other key to continue.<br/>' +
        '<u>Go as fast as you can</u> while being accurate.<br/><br/></p>' +
        '<p align="center">Press the <b>space bar</b> when you are ready to start.</font></p></div>',
      instCategoriesPracticeTouch: [
        '<div>',
        '<p align="center">',
        '<u>Part blockNum of nBlocks</u>',
        '</p>',
        '<p align="left" style="margin-left:5px">',
        '<br/>',
        'Put a left finger over the <b>left</b> green area for items that belong to the category <font color="#336600">leftCategory</font>.<br/>',
        'Put a right finger over the <b>right</b> green area for items that belong to the category <font color="#336600">rightCategory</font>.<br/>',
        'Items will appear one at a time.<br/>',
        '<br/>',
        'If you make a mistake, a red <font color="#ff0000"><b>X</b></font> will appear. Touch the other side. <u>Go as fast as you can</u> while being accurate.',
        '</p>',
        '<p align="center">Touch the <b>lower </b> green area to start.</p>',
        '</div>'
      ].join('\n'),

      instFirstCombined: '<div><p align="center" style="font-size:20px; font-family:arial">' +
        '<font color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' +
        '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' +
        'Use the <b>E</b> key for <font color="#336600">leftCategory</font> and for <font color="#0000ff">leftAttribute</font>.<br/>' +
        'Use the <b>I</b> key for <font color="#336600">rightCategory</font> and for  <font color="#0000ff">rightAttribute</font>.<br/>' +
        'Each item belongs to only one category.<br/><br/>' +
        'If you make a mistake, a red <font color="#ff0000"><b>X</b></font> will appear. ' +
        'Press the other key to continue.<br/>' +
        '<u>Go as fast as you can</u> while being accurate.<br/><br/></p>' +
        '<p align="center">Press the <b>space bar</b> when you are ready to start.</font></p></div>',
      instFirstCombinedTouch: [
        '<div>',
        '<p align="center">',
        '<u>Part blockNum of nBlocks</u>',
        '</p>',
        '<br/>',
        '<br/>',
        '<p align="left" style="margin-left:5px">',
        'Put a left finger over the <b>left</b> green area for <font color="#336600">leftCategory</font> items and for <font color="#0000ff">leftAttribute</font>.</br>',
        'Put a right finger over the <b>right</b> green area for <font color="#336600">rightCategory</font> items and for <font color="#0000ff">rightAttribute</font>.</br>',
        'If you make a mistake, a red <font color="#ff0000"><b>X</b></font> will appear. Touch the other side. <u>Go as fast as you can</u> while being accurate.</br>',
        '</p>',
        '<p align="center">Touch the <b>lower </b> green area to start.</p>',
        '</div>'
      ].join('\n'),

      instSecondCombined: '<div><p align="center" style="font-size:20px; font-family:arial">' +
        '<font color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' +
        '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' +
        'This is the same as the previous part.<br/>' +
        'Use the <b>E</b> key for <font color="#336600">leftCategory</font> and for <font color="#0000ff">leftAttribute</font>.<br/>' +
        'Use the <b>I</b> key for <font color="#336600">rightCategory</font> and for  <font color="#0000ff">rightAttribute</font>.<br/>' +
        'Each item belongs to only one category.<br/><br/>' +
        '<u>Go as fast as you can</u> while being accurate.<br/><br/></p>' +
        '<p align="center">Press the <b>space bar</b> when you are ready to start.</font></p></div>',
      instSecondCombinedTouch: [
        '<div>',
        '<p align="center"><u>Part blockNum of nBlocks</u></p>',
        '<br/>',
        '<br/>',

        '<p align="left" style="margin-left:5px">',
        'Put a left finger over the <b>left</b> green area for <font color="#336600">leftCategory</font> items and for <font color="#0000ff">leftAttribute</font>.<br/>',
        'Put a right finger over the <b>right</b> green area for <font color="#336600">rightCategory</font> items and for <font color="#0000ff">rightAttribute</font>.<br/>',
        '<br/>',
        '<u>Go as fast as you can</u> while being accurate.<br/>',
        '</p>',
        '<p align="center">Touch the <b>lower </b> green area to start.</p>',
        '</div>'
      ].join('\n'),

      instSwitchCategories: '<div><p align="center" style="font-size:20px; font-family:arial">' +
        '<font color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' +
        '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' +
        '<b>Watch out, the labels have changed position!</b><br/>' +
        'Use the left finger on the <b>E</b> key for <font color="#336600">leftCategory</font>.<br/>' +
        'Use the right finger on the <b>I</b> key for <font color="#336600">rightCategory</font>.<br/><br/>' +
        '<u>Go as fast as you can</u> while being accurate.<br/><br/></p>' +
        '<p align="center">Press the <b>space bar</b> when you are ready to start.</font></p></div>',
      instSwitchCategoriesTouch: [
        '<div>',
        '<p align="center">',
        '<u>Part blockNum of nBlocks</u>',
        '</p>',
        '<p align="left" style="margin-left:5px">',
        '<br/>',
        'Watch out, the labels have changed position!<br/>',
        'Put a left finger over the <b>left</b> green area for <font color="#336600">leftCategory</font> items.<br/>',
        'Put a right finger over the <b>right</b> green area for <font color="#336600">rightCategory</font> items.<br/>',
        'Items will appear one at a time.',
        '<br/>',
        'If you make a mistake, a red <font color="#ff0000"><b>X</b></font> will appear. Touch the other side. <u>Go as fast as you can</u> while being accurate.<br/>',
        '</p>',
        '<p align="center">Touch the <b>lower </b> green area to start.</p>',
        '</div>'
      ].join('\n'),

      instThirdCombined: 'instFirstCombined', //this means that we're going to use the instFirstCombined property for the third combined block as well. You can change that.
      instFourthCombined: 'instSecondCombined', //this means that we're going to use the instSecondCombined property for the fourth combined block as well. You can change that.
      instThirdCombinedTouch: 'instFirstCombined', //this means that we're going to use the instFirstCombined property for the third combined block as well. You can change that.
      instFourthCombinedTouch: 'instSecondCombined', //this means that we're going to use the instSecondCombined property for the fourth combined block as well. You can change that.

      //The default feedback messages for each cutoff -
      //attribute1, and attribute2 will be replaced with the name of attribute1 and attribute2.
      //categoryA is the name of the category that is found to be associated with attribute1,
      //and categoryB is the name of the category that is found to be associated with attribute2.
      fb_strong_Att1WithCatA_Att2WithCatB: 'Your data suggest a strong automatic preference for categoryB over categoryA.',
      fb_moderate_Att1WithCatA_Att2WithCatB: 'Your data suggest a moderate automatic preference for categoryB over categoryA.',
      fb_slight_Att1WithCatA_Att2WithCatB: 'Your data suggest a slight automatic preference for categoryB over categoryA.',
      fb_equal_CatAvsCatB: 'Your data suggest no automatic preference between categoryA and categoryB.',

      //Error messages in the feedback
      manyErrors: 'There were too many errors made to determine a result.',
      tooFast: 'There were too many fast trials to determine a result.',
      notEnough: 'There were not enough trials to determine a result.'
    };

    // extend the "current" object with the default
    _.defaults(piCurrent, options, iatObj);

    // are we on the touch version
    var isTouch = piCurrent.isTouch;

    //We use these objects a lot, so let's read them here
    var att1 = piCurrent.attribute1;
    var att2 = piCurrent.attribute2;
    var cat1 = piCurrent.category1;
    var cat2 = piCurrent.category2;
    if (isTouch) {
      var maxW = piCurrent.touchMaxStimulusWidth;
      var maxH = piCurrent.touchMaxStimulusHeight;
      att1.stimulusCss.maxWidth = maxW;
      att2.stimulusCss.maxWidth = maxW;
      cat1.stimulusCss.maxWidth = maxW;
      cat2.stimulusCss.maxWidth = maxW;
      att1.stimulusCss.maxHeight = maxH;
      att2.stimulusCss.maxHeight = maxH;
      cat1.stimulusCss.maxHeight = maxH;
      cat2.stimulusCss.maxHeight = maxH;
    }

    //Set the attribute on the left.
    var rightAttName = (piCurrent.randomAttSide) ? (Math.random() >= 0.5 ? att1.name : att2.name) : att2.name;

    /**
     * Create inputs
     */

    var leftInput = !isTouch ? { handle: 'left', on: 'keypressed', key: 'e' } : { handle: 'left', on: 'click', stimHandle: 'left' };
    var rightInput = !isTouch ? { handle: 'right', on: 'keypressed', key: 'i' } : { handle: 'right', on: 'click', stimHandle: 'right' };
    var proceedInput = !isTouch ? { handle: 'space', on: 'space' } : { handle: 'space', on: 'bottomTouch', css: piCurrent.bottomTouchCss };

    /**
    *Set basic settings.
    */
    API.addSettings('canvas', piCurrent.canvas);
    API.addSettings('base_url', piCurrent.base_url);
    API.addSettings('redirect', ''); // Prevent automatic redirect after task ends
    console.log("KAKLDA", window.onIATDone)

    API.addSettings('hooks', {
      endTask: function () {
        const DScoreObj = scorer.computeD();
        piCurrent.feedback = DScoreObj.FBMsg;

        console.log("c fini", { block3Cond: piCurrent.block3Cond, feedback: DScoreObj.FBMsg, d: DScoreObj.DScore })
        window.onIATDone({ block3Cond: block3Cond, feedback: DScoreObj.FBMsg, d: DScoreObj.DScore || 0.5 })
      }
    });
    /**
     * Create default sorting trial
     */
    API.addTrialSets('sort', {
      // by default each trial is correct, this is modified in case of an error
      data: { score: 0, parcel: 'first' }, //We're using only one parcel for computing the score, so we're always going to call it 'first'.
      // set the interface for trials
      input: [
        { handle: 'skip1', on: 'keypressed', key: 27 }, //Esc + Enter will skip blocks
        leftInput,
        rightInput
      ],

      // user interactions
      interactions: [
        // begin trial : display stimulus immediately
        {
          conditions: [{ type: 'begin' }],
          actions: [{ type: 'showStim', handle: 'targetStim' }]
        },
        // error response
        {
          conditions: [
            { type: 'inputEqualsTrial', property: 'corResp', negate: true }, //Not the correct response.
            { type: 'inputEquals', value: ['right', 'left'] }	// responded with one of the two responses
          ],
          actions: [
            { type: 'setTrialAttr', setter: { score: 1 } },	// set the score to 1
            { type: 'showStim', handle: 'error' }, // show error stimulus
            { type: 'trigger', handle: 'onError' }	// perhaps we need to end the trial (if no errorCorrection)
          ]
        },
        // error when there is no correction
        {
          conditions: [
            { type: 'globalEquals', property: 'errorCorrection', value: false }, //no error correction.
            { type: 'inputEquals', value: 'onError' } //Was error
          ],
          actions: [
            { type: 'removeInput', handle: 'All' }, //Cannot respond anymore
            { type: 'log' }, // log this trial
            { type: 'trigger', handle: 'ITI', duration: piCurrent.errorFBDuration } // Continue to the ITI, after that error fb has been displayed
          ]
        },
        // correct
        {
          conditions: [{ type: 'inputEqualsTrial', property: 'corResp' }],	// check if the input handle is equal to correct response (in the trial's data object)
          actions: [
            { type: 'removeInput', handle: 'All' }, //Cannot respond anymore
            { type: 'hideStim', handle: 'All' }, // hide everything
            { type: 'log' }, // log this trial
            { type: 'trigger', handle: 'ITI' } // End the trial after ITI
          ]
        },
        // Display nothing for ITI until the next trial
        {
          conditions: [{ type: 'inputEquals', value: 'ITI' }],
          actions: [
            { type: 'removeInput', handle: 'All' }, //Cannot respond anymore
            { type: 'hideStim', handle: 'All' }, // hide everything
            { type: 'trigger', handle: 'end', duration: piCurrent.ITIDuration } // Continue to the ITI, after that error fb has been displayed
          ]
        },
        // end after ITI
        {
          conditions: [{ type: 'inputEquals', value: 'end' }],
          actions: [
            { type: 'endTrial' }
          ]
        },

        // skip block: enter and then ESC
        {
          conditions: [{ type: 'inputEquals', value: 'skip1' }],
          actions: [
            { type: 'setInput', input: { handle: 'skip2', on: 'enter' } } // allow skipping if next key is enter.
          ]
        },
        // skip block: then ESC
        {
          conditions: [{ type: 'inputEquals', value: 'skip2' }],
          actions: [
            { type: 'goto', destination: 'nextWhere', properties: { blockStart: true } },
            { type: 'endTrial' }
          ]
        }
      ]
    });

    /**
     * Create default instructions trials
     */
    API.addTrialSets('instructions', [
      // generic instructions trial, to be inherited by all other inroduction trials
      {
        // set block as generic so we can inherit it later
        data: { blockStart: true, condition: 'instructions', score: 0, block: 0 },

        // create user interface (just click to move on...)
        input: [
          proceedInput
        ],

        interactions: [
          // display instructions
          {
            conditions: [{ type: 'begin' }],
            actions: [
              { type: 'showStim', handle: 'All' }
            ]
          },
          // space hit, end trial soon
          {
            conditions: [{ type: 'inputEquals', value: 'space' }],
            actions: [
              { type: 'hideStim', handle: 'All' },
              { type: 'removeInput', handle: 'space' },
              { type: 'log' },
              { type: 'trigger', handle: 'endTrial', duration: 500 }
            ]
          },
          {
            conditions: [{ type: 'inputEquals', value: 'endTrial' }],
            actions: [{ type: 'endTrial' }]
          }
        ]
      }
    ]);

    /**
     * All basic trials.
     */

    //Helper function to create a basic trial for a certain category (or attribute)
    //as an in or out trial (right is in and left is out).
    function createBasicTrialSet(params) {//params: side is left or right. stimSet is the name of the stimulus set.
      var set = [{
        inherit: 'sort',
        data: { corResp: params.side },
        stimuli:
          [
            { inherit: { type: 'exRandom', set: params.stimSet } },
            { inherit: { set: 'error' } }
          ]
      }];
      return set;
    }

    var basicTrialSets = {};
    //Four trials for the attributes.
    basicTrialSets.att1left =
      createBasicTrialSet({ side: 'left', stimSet: 'att1' });
    basicTrialSets.att1right =
      createBasicTrialSet({ side: 'right', stimSet: 'att1' });
    basicTrialSets.att2left =
      createBasicTrialSet({ side: 'left', stimSet: 'att2' });
    basicTrialSets.att2right =
      createBasicTrialSet({ side: 'right', stimSet: 'att2' });
    //Four trials for the categories.
    basicTrialSets.cat1left =
      createBasicTrialSet({ side: 'left', stimSet: 'cat1' });
    basicTrialSets.cat1right =
      createBasicTrialSet({ side: 'right', stimSet: 'cat1' });
    basicTrialSets.cat2left =
      createBasicTrialSet({ side: 'left', stimSet: 'cat2' });
    basicTrialSets.cat2right =
      createBasicTrialSet({ side: 'right', stimSet: 'cat2' });

    API.addTrialSets(basicTrialSets);

    /**
     *	Stimulus Sets
     */

    //Basic stimuli
    API.addStimulusSets({
      // This Default stimulus is inherited by the other stimuli so that we can have a consistent look and change it from one place
      Default: [
        { css: { color: piCurrent.fontColor, 'font-size': '2em' } }
      ],

      instructions: [
        {
          css: { 'font-size': '1.4em', color: 'black', lineHeight: 1.2 }, nolog: true,
          location: { left: 0, top: 0 }, size: { width: piCurrent.instWidth }
        }
      ],

      target: [{
        data: { handle: 'targetStim' }
      }],
      att1:
        [{
          data: { alias: att1.name },
          inherit: 'target',
          css: att1.stimulusCss,
          media: { inherit: { type: 'exRandom', set: 'att1' } }
        }],
      att2:
        [{
          data: { alias: att2.name },
          inherit: 'target',
          css: att2.stimulusCss,
          media: { inherit: { type: 'exRandom', set: 'att2' } }
        }],
      cat1:
        [{
          data: { alias: cat1.name },
          inherit: 'target',
          css: cat1.stimulusCss,
          media: { inherit: { type: 'exRandom', set: 'cat1' } }
        }],
      cat2:
        [{
          data: { alias: cat2.name },
          inherit: 'target',
          css: cat2.stimulusCss,
          media: { inherit: { type: 'exRandom', set: 'cat2' } }
        }],
      // this stimulus used for giving feedback, in this case only the error notification
      error: [{
        handle: 'error', location: { top: 75 }, css: { color: 'red', 'font-size': '4em', 'text-align': 'center' }, media: { word: 'X' }, nolog: true
      }],

      touchInputStimuli: [
        { media: { html: '<div></div>' }, size: { height: 48, width: 30 }, css: { background: '#00FF00', opacity: 0.3, zindex: -1 }, location: { right: 0 }, data: { handle: 'right' } },
        { media: { html: '<div></div>' }, size: { height: 48, width: 30 }, css: { background: '#00FF00', opacity: 0.3, zindex: -1 }, location: { left: 0 }, data: { handle: 'left' } }
      ]
    });

    /**
     *	Media Sets
     */
    API.addMediaSets({
      att1: att1.stimulusMedia, att2: att2.stimulusMedia,
      cat1: cat1.stimulusMedia, cat2: cat2.stimulusMedia
    });

    /**
     *	Create the Task sequence
     */

    //helper Function for getting the instructions HTML.
    function getInstFromTemplate(params) {//params: instTemplate, blockNum, nBlocks, leftCat, rightCat, leftAtt, rightAtt.
      var retText = params.instTemplate
        .replace(/leftCategory/g, params.leftCategory)
        .replace(/rightCategory/g, params.rightCategory)
        .replace(/leftAttribute/g, params.leftAttribute)
        .replace(/rightAttribute/g, params.rightAttribute)
        .replace(/blockNum/g, params.blockNum)
        .replace(/nBlocks/g, params.nBlocks);
      return retText;
    }

    //Helper function to create the trial's layout
    function getLayout(params) {

      function buildContent(layout) {
        if (!layout) { return ''; }
        var isImage = !!layout.image;
        var content = layout.word || layout.html || layout.image || layout;
        if (_.isString(layout) || layout.word) { content = _.escape(content); }
        return isImage ? '<img src="' + piCurrent.base_url.image + content + '" style="max-width:100%;width:100%" />' : content;
      }

      function buildStyle(css) {
        css || (css = {});
        var style = '';
        for (var i in css) { style += i + ':' + css[i] + ';'; }
        return style;
      }

      var template = '' +
        '   <div style="text-align: <%= stimulusData.isLeft ? "left" : "right" %>; display: inline-block; width: 50%">  ' +
        '   	<div style="font-size:0.8em; <%= stimulusData.keysCss %>; visibility:<%= stimulusData.isTouch ? \'hidden\' : \'visible\' %>">  ' +
        '   		<%= stimulusData.isLeft ? stimulusData.leftKeyText : stimulusData.rightKeyText %>  ' +
        '   	</div>  ' +
        '     ' +
        '   	<div style="font-size:1.3em;<%= stimulusData.firstCss %>">  ' +
        '   		<%= stimulusData.first %>  ' +
        '   	</div>  ' +
        '     ' +
        '   	<% if (stimulusData.second) { %>  ' +
        '   		<div style="font-size:2.3em; <%= stimulusData.orCss %>"><%= stimulusData.orText %> </div>  ' +
        '   		<div style="font-size:1.3em; max-width:100%; <%= stimulusData.secondCss %>">  ' +
        '   			<%= stimulusData.second %>  ' +
        '   		</div>  ' +
        '   	<% } %>  ' +
        '   </div>  ';

      //Attributes are above the categories.
      var layout = [
        {
          location: { left: 0, top: 0 },
          media: { html: template },
          data: {
            first: buildContent(_.get(params, 'left1.title.media')),
            firstCss: buildStyle(_.get(params, 'left1.title.css')),
            second: buildContent(_.get(params, 'left2.title.media')),
            secondCss: buildStyle(_.get(params, 'left2.title.css')),
            leftKeyText: buildContent(_.get(piCurrent, 'leftKeyText')),
            rightKeyText: buildContent(_.get(piCurrent, 'rightKeyText')),
            keysCss: buildStyle(_.get(piCurrent, 'keysCss')),
            orText: buildContent(_.get(piCurrent, 'orText')),
            orCss: buildStyle(_.get(piCurrent, 'orCss')),
            isTouch: isTouch,
            isLeft: true
          }
        },
        {
          location: { right: 0, top: 0 },
          media: { html: template },
          data: {
            first: buildContent(_.get(params, 'right1.title.media')),
            firstCss: buildStyle(_.get(params, 'right1.title.css')),
            second: buildContent(_.get(params, 'right2.title.media')),
            secondCss: buildStyle(_.get(params, 'right2.title.css')),
            leftKeyText: buildContent(_.get(piCurrent, 'leftKeyText')),
            rightKeyText: buildContent(_.get(piCurrent, 'rightKeyText')),
            keysCss: buildStyle(_.get(piCurrent, 'keysCss')),
            orText: buildContent(_.get(piCurrent, 'orText')),
            orCss: buildStyle(_.get(piCurrent, 'orCss')),
            isTouch: isTouch,
            isLeft: false
          }
        }
      ];

      if (!params.isInst && params.remindError) {
        layout.push({
          location: { bottom: 1 }, css: { color: piCurrent.fontColor, 'font-size': '1em' },
          media: { html: isTouch ? params.remindErrorTextTouch : params.remindErrorText }
        });
      }

      if (!params.isInst && isTouch) {
        layout.push({ inherit: { type: 'byData', set: 'touchInputStimuli', data: { handle: 'right' } } });
        layout.push({ inherit: { type: 'byData', set: 'touchInputStimuli', data: { handle: 'left' } } });
      }

      return layout;
    }

    //helper function for creating an instructions trial
    function getInstTrial(params) {
      var instParams = { isInst: true };
      //The names of the category and attribute labels.
      if (params.nCats == 2) {//When there are only two categories in the block, one two of these will appear in the instructions.
        instParams.leftAttribute = params.left1.name;
        instParams.rightAttribute = params.right1.name;
        instParams.leftCategory = params.left1.name;
        instParams.rightCategory = params.right1.name;
      }
      else {
        instParams.leftAttribute = params.left1.name;
        instParams.rightAttribute = params.right1.name;
        instParams.leftCategory = params.left2.name;
        instParams.rightCategory = params.right2.name;
      }
      _.extend(instParams, params);
      var instLocation = { bottom: 1 };
      if (isTouch == true) {
        instLocation = { left: 0, top: (params.nCats == 2) ? 7 : 10 };
      }
      var instTrial = {
        inherit: 'instructions',
        data: { blockStart: true },
        layout: getLayout(instParams),
        stimuli: [
          {
            inherit: 'instructions',
            media: { html: getInstFromTemplate(instParams) },
            location: instLocation,
            nolog: true
          },
          {
            data: { handle: 'dummy', alias: 'dummy' },
            media: { word: ' ' },
            location: { top: 1 }
          }
        ]
      };

      return instTrial;
    }

    //Get a mixer for a mini-block in a 2-categories block.
    function getMiniMixer2(params) {//{nTrialsInMini : , currentCond : , rightTrial : , leftTrial : , blockNum : , blockLayout : )
      var mixer = {
        mixer: 'repeat',
        times: params.nTrialsInMini / 2,
        data:
          [
            {
              inherit: params.rightTrial,
              data: { condition: params.currentCond, block: params.blockNum },
              layout: params.blockLayout
            },
            {
              inherit: params.leftTrial,
              data: { condition: params.currentCond, block: params.blockNum },
              layout: params.blockLayout
            }
          ]
      };
      return ({
        mixer: 'random',
        data: [mixer] //Completely randomize the repeating trials.
      });
    }

    //Get a mixer for a mini-block in a 4-categories block.
    function getMiniMixer4(params) {//{nTrialsInMini : , currentCond : , rightTrial1 : , leftTrial1 : , rightTrial2 : , leftTrial2 : , blockNum : , blockLayout : )

      ////Because of the alternation, we randomize the trial order ourselves.
      var atts = [];
      var cats = [];
      var iTrial;

      //Fill
      for (iTrial = 1; iTrial <= params.nTrialsInMini; iTrial += 4) {
        atts.push(1);
        atts.push(2);
        cats.push(1);
        cats.push(2);
      }
      //Randomize order
      atts = _.shuffle(atts);
      cats = _.shuffle(cats);

      var mixerData = [];
      var iCat = 0;
      var iAtt = 0;
      for (iTrial = 1; iTrial <= params.nTrialsInMini; iTrial += 2) {
        mixerData.push(
          {
            inherit: (cats[iCat] == 1) ? params.leftTrial2 : params.rightTrial2,
            data: { condition: params.currentCond, block: params.blockNum },
            layout: params.blockLayout
          });
        iCat++;
        mixerData.push(
          {
            inherit: (atts[iAtt] == 1) ? params.leftTrial1 : params.rightTrial1,
            data: { condition: params.currentCond, block: params.blockNum },
            layout: params.blockLayout
          });
        iAtt++;
      }

      return ({
        mixer: 'wrapper',
        data: mixerData
      });
    }

    ////////////////////////////////////////////////////////////////
    ////AFTER ALL the helper functions, it is time to create the trial sequence.
    var trialSequence = [];

    var globalObj = piCurrent;

    //These parameters are used to create trials.
    var blockParamsAtts = {
      nBlocks: globalObj.nBlocks,
      remindError: globalObj.remindError,
      remindErrorText: globalObj.remindErrorText,
      remindErrorTextTouch: globalObj.remindErrorTextTouch
    };
    //////////////////////////////
    ////Block 1: Categories block
    var iBlock = 1;
    var blockParamsCats = {
      nBlocks: globalObj.nBlocks,
      remindError: globalObj.remindError,
      remindErrorText: globalObj.remindErrorText,
      remindErrorTextTouch: globalObj.remindErrorTextTouch
    };
    //Set sides
    var rightCatName = (globalObj.randomBlockOrder ? (Math.random() >= 0.5 ? cat1.name : cat2.name) : cat2.name);
    var leftCatTrial = 'cat1left';
    blockParamsCats.left1 = cat1;
    var rightCatTrial = 'cat2right';
    blockParamsCats.right1 = cat2;
    if (rightCatName == cat1.name) {
      blockParamsCats.right1 = cat1;
      rightCatTrial = 'cat1right';
      blockParamsCats.left1 = cat2;
      leftCatTrial = 'cat2left';
    }
    var blockCondition = blockParamsCats.left1.name + ',' + blockParamsCats.right1.name;
    blockParamsCats.nMiniBlocks = globalObj.blockCategories_nMiniBlocks;
    blockParamsCats.nTrials = globalObj.blockCategories_nTrials;
    blockParamsCats.blockNum = iBlock;
    blockParamsCats.nCats = 2;
    blockParamsCats.instTemplate = isTouch ? globalObj.instCategoriesPracticeTouch : globalObj.instCategoriesPractice;
    trialSequence.push(getInstTrial(blockParamsCats));
    var blockLayout = getLayout(blockParamsCats);
    var nTrialsInMini = blockParamsCats.nTrials / blockParamsCats.nMiniBlocks;
    var iBlock2Mini;
    for (iBlock2Mini = 1; iBlock2Mini <= blockParamsCats.nMiniBlocks; iBlock2Mini++) {
      trialSequence.push(getMiniMixer2({
        nTrialsInMini: nTrialsInMini, currentCond: blockCondition,
        rightTrial: rightCatTrial, leftTrial: leftCatTrial, blockNum: iBlock,
        blockLayout: blockLayout
      }));
    }
    //////////////////////////////
    ////Block 2: Attributes
    iBlock++;
    //Set variables related to the sides
    blockParamsAtts.left1 = att1;
    blockParamsAtts.right1 = att2;
    //Names of the trials in this block
    var leftAttTrial = 'att1left';
    var rightAttTrial = 'att2right';
    if (rightAttName == att1.name) {
      blockParamsAtts.right1 = att1;
      rightAttTrial = 'att1right';
      leftAttTrial = 'att2left';
      blockParamsAtts.left1 = att2;
    }
    //Set the block's condition
    blockCondition = blockParamsAtts.left1.name + ',' + blockParamsAtts.right1.name;
    //Number variables
    blockParamsAtts.nMiniBlocks = globalObj.blockAttributes_nMiniBlocks;
    blockParamsAtts.nTrials = globalObj.blockAttributes_nTrials;
    blockParamsAtts.blockNum = iBlock;
    blockParamsAtts.nCats = 2;
    //Instructions trial
    blockParamsAtts.instTemplate = isTouch ? globalObj.instAttributePracticeTouch : globalObj.instAttributePractice;
    trialSequence.push(getInstTrial(blockParamsAtts));
    //Layout for the sorting trials
    blockLayout = getLayout(blockParamsAtts);
    //Number of trials in a mini block.
    nTrialsInMini = blockParamsAtts.nTrials / blockParamsAtts.nMiniBlocks;
    //Add a mixer for each mini block.
    var iBlock1Mini;
    for (iBlock1Mini = 1; iBlock1Mini <= blockParamsAtts.nMiniBlocks; iBlock1Mini++) {
      trialSequence.push(getMiniMixer2(
        {
          nTrialsInMini: nTrialsInMini, currentCond: blockCondition,
          rightTrial: rightAttTrial, leftTrial: leftAttTrial, blockNum: iBlock,
          blockLayout: blockLayout
        }));
    }
    //////////////////////////////
    ////Block 3: First combined block
    iBlock++;
    var blockParamsCombined = {
      nBlocks: globalObj.nBlocks,
      remindError: globalObj.remindError,
      remindErrorText: globalObj.remindErrorText,
      remindErrorTextTouch: globalObj.remindErrorTextTouch
    };
    //We get the categories from the first two blocks.
    blockParamsCombined.right1 = blockParamsAtts.right1;
    blockParamsCombined.left1 = blockParamsAtts.left1;
    blockParamsCombined.right2 = blockParamsCats.right1;
    blockParamsCombined.left2 = blockParamsCats.left1;
    blockCondition = blockParamsCombined.left2.name + '/' + blockParamsCombined.left1.name + ',' + blockParamsCombined.right2.name + '/' + blockParamsCombined.right1.name;
    //We will send the condition of the third block to the server at the end.
    var block3Cond = blockCondition;
    //Number variables.
    blockParamsCombined.nMiniBlocks = globalObj.blockFirstCombined_nMiniBlocks;
    blockParamsCombined.nTrials = globalObj.blockFirstCombined_nTrials;
    blockParamsCombined.blockNum = iBlock;
    blockParamsCombined.nCats = 4;
    //Instructions trial.
    blockParamsCombined.instTemplate = isTouch ? globalObj.instFirstCombinedTouch : globalObj.instFirstCombined;
    trialSequence.push(getInstTrial(blockParamsCombined));
    //Get the layout for the sorting trials.
    blockLayout = getLayout(blockParamsCombined);
    //Fill the trials.
    nTrialsInMini = blockParamsCombined.nTrials / blockParamsCombined.nMiniBlocks;
    var iBlock3Mini;
    for (iBlock3Mini = 1; iBlock3Mini <= blockParamsCombined.nMiniBlocks; iBlock3Mini++) {
      trialSequence.push(getMiniMixer4({
        nTrialsInMini: nTrialsInMini, currentCond: blockCondition,
        rightTrial1: rightAttTrial, leftTrial1: leftAttTrial,
        rightTrial2: rightCatTrial, leftTrial2: leftCatTrial,
        blockNum: iBlock, blockLayout: blockLayout
      }));
    }
    //////////////////////////////
    ////Second combined block.
    if (globalObj.nBlocks == 7) {//Fourth block is another combined block.
      iBlock++;
      blockParamsCombined.blockNum = iBlock;
      blockParamsCombined.nMiniBlocks = globalObj.blockSecondCombined_nMiniBlocks;
      blockParamsCombined.nTrials = globalObj.blockSecondCombined_nTrials;
      //Instructions trial.
      blockParamsCombined.instTemplate = isTouch ? globalObj.instSecondCombinedTouch : globalObj.instSecondCombined;
      trialSequence.push(getInstTrial(blockParamsCombined));
      //The layout for the sorting trials.
      blockLayout = getLayout(blockParamsCombined);
      //Fill the trials
      nTrialsInMini = blockParamsCombined.nTrials / blockParamsCombined.nMiniBlocks;
      var iBlock4Mini;
      for (iBlock4Mini = 1; iBlock4Mini <= blockParamsCombined.nMiniBlocks; iBlock4Mini++) {
        trialSequence.push(getMiniMixer4({
          nTrialsInMini: nTrialsInMini, currentCond: blockCondition,
          rightTrial1: rightAttTrial, leftTrial1: leftAttTrial,
          rightTrial2: rightCatTrial, leftTrial2: leftCatTrial,
          blockNum: iBlock, blockLayout: blockLayout
        }));
      }

    }
    //////////////////////////////
    ////Switch categories side block.
    iBlock++;
    //Do the switch
    blockParamsCats.right1 = blockParamsCombined.left2;
    blockParamsCats.left1 = blockParamsCombined.right2;
    rightCatTrial = (rightCatTrial == 'cat1right') ? 'cat2right' : 'cat1right';
    leftCatTrial = (leftCatTrial == 'cat1left') ? 'cat2left' : 'cat1left';
    blockParamsCats.instTemplate = isTouch ? globalObj.instSwitchCategoriesTouch : globalObj.instSwitchCategories;
    //Get numbers
    blockParamsCats.nMiniBlocks = globalObj.blockSwitch_nMiniBlocks;
    blockParamsCats.nTrials = globalObj.blockSwitch_nTrials;
    //The rest is like blocks 1 and 2.
    blockCondition = blockParamsCats.left1.name + ',' + blockParamsCats.right1.name;
    blockParamsCats.blockNum = iBlock;
    blockParamsCats.nCats = 2;
    trialSequence.push(getInstTrial(blockParamsCats));
    //The layout for the sorting trials.
    blockLayout = getLayout(blockParamsCats);
    //Fill the trials.
    nTrialsInMini = blockParamsCats.nTrials / blockParamsCats.nMiniBlocks;
    var iBlock5Mini;
    for (iBlock5Mini = 1; iBlock5Mini <= blockParamsCats.nMiniBlocks; iBlock5Mini++) {
      trialSequence.push(getMiniMixer2({
        nTrialsInMini: nTrialsInMini, currentCond: blockCondition,
        rightTrial: rightCatTrial, leftTrial: leftCatTrial, blockNum: iBlock,
        blockLayout: blockLayout
      }));
    }
    //////////////////////////////
    ////The other combined block
    iBlock++;
    //Get the categories side from the switch block.
    blockParamsCombined.right2 = blockParamsCats.right1;
    blockParamsCombined.left2 = blockParamsCats.left1;
    blockCondition = blockParamsCombined.left2.name + '/' + blockParamsCombined.left1.name + ',' + blockParamsCombined.right2.name + '/' + blockParamsCombined.right1.name;
    //Number variables.
    blockParamsCombined.nMiniBlocks = globalObj.blockFirstCombined_nMiniBlocks;
    blockParamsCombined.nTrials = globalObj.blockFirstCombined_nTrials;
    blockParamsCombined.blockNum = iBlock;
    blockParamsCombined.nCats = 4;
    //Instruction trial.
    blockParamsCombined.instTemplate = isTouch ? globalObj.instFirstCombinedTouch : globalObj.instFirstCombined;
    if (globalObj.instThirdCombined != 'instFirstCombined') {
      blockParamsCombined.instTemplate = isTouch ? globalObj.instThirdCombinedTouch : globalObj.instThirdCombined;
    }
    trialSequence.push(getInstTrial(blockParamsCombined));
    //Layout for the sorting trials.
    blockLayout = getLayout(blockParamsCombined);
    //Fill the trials.
    nTrialsInMini = blockParamsCombined.nTrials / blockParamsCombined.nMiniBlocks;
    var iBlock6Mini;
    for (iBlock6Mini = 1; iBlock6Mini <= blockParamsCombined.nMiniBlocks; iBlock6Mini++) {
      trialSequence.push(getMiniMixer4({
        nTrialsInMini: nTrialsInMini, currentCond: blockCondition,
        rightTrial1: rightAttTrial, leftTrial1: leftAttTrial,
        rightTrial2: rightCatTrial, leftTrial2: leftCatTrial,
        blockNum: iBlock, blockLayout: blockLayout
      }));
    }
    //////////////////////////////
    ////Second combined block.
    if (globalObj.nBlocks == 7) {//Fourth block is another combined block.
      iBlock++;
      blockParamsCombined.blockNum = iBlock;
      blockParamsCombined.nMiniBlocks = globalObj.blockSecondCombined_nMiniBlocks;
      blockParamsCombined.nTrials = globalObj.blockSecondCombined_nTrials;
      //Instructions trial.
      blockParamsCombined.instTemplate = isTouch ? globalObj.instSecondCombinedTouch : globalObj.instSecondCombined;
      if (globalObj.instFourthCombined != 'instSecondCombined') {
        blockParamsCombined.instTemplate = isTouch ? globalObj.instFourthCombinedTouch : globalObj.instFourthCombined;
      }
      trialSequence.push(getInstTrial(blockParamsCombined));
      //Layout for sorting trials.
      blockLayout = getLayout(blockParamsCombined);
      //Fill the trials.
      nTrialsInMini = blockParamsCombined.nTrials / blockParamsCombined.nMiniBlocks;
      var iBlock7Mini;
      for (iBlock7Mini = 1; iBlock7Mini <= blockParamsCombined.nMiniBlocks; iBlock7Mini++) {
        trialSequence.push(getMiniMixer4({
          nTrialsInMini: nTrialsInMini, currentCond: blockCondition,
          rightTrial1: rightAttTrial, leftTrial1: leftAttTrial,
          rightTrial2: rightCatTrial, leftTrial2: leftCatTrial,
          blockNum: iBlock, blockLayout: blockLayout
        }));
      }
    }
    //////////////////////////////
    //Add final trial
    // trialSequence.push({
    //   inherit: 'instructions',
    //   data: { blockStart: true },
    //   layout: [{ media: { word: '' } }],
    //   stimuli: [
    //     {
    //       inherit: 'Default',
    //       media: { word: (isTouch ? piCurrent.finalTouchText : piCurrent.finalText) }
    //     }
    //   ]
    // });

    //Add the trials sequence to the API.
    API.addSequence(trialSequence);

    /**
    *Compute scores and feedback messages
    **/
    var errorLatencyUse = piCurrent.errorCorrection ? 'latency' : 'penalty';
    //Settings for the score computation.
    scorer.addSettings('compute', {
      ErrorVar: 'score',
      condVar: 'condition',
      //condition 1
      cond1VarValues: [
        cat1.name + '/' + att1.name + ',' + cat2.name + '/' + att2.name,
        cat2.name + '/' + att2.name + ',' + cat1.name + '/' + att1.name
      ],
      //condition 2
      cond2VarValues: [
        cat2.name + '/' + att1.name + ',' + cat1.name + '/' + att2.name,
        cat1.name + '/' + att2.name + ',' + cat2.name + '/' + att1.name
      ],
      parcelVar: "parcel", //We use only one parcel because it is probably not less reliable.
      parcelValue: ['first'],
      fastRT: 150, //Below this reaction time, the latency is considered extremely fast.
      maxFastTrialsRate: 0.1, //Above this % of extremely fast responses within a condition, the participant is considered too fast.
      minRT: 400, //Below this latency
      maxRT: 10000, //above this
      errorLatency: { use: errorLatencyUse, penalty: 600, useForSTD: true },
      // postSettings: { score: "score", msg: "feedback", url: "/implicit/scorer" }
    });

    //Helper function to set the feedback messages.
    function getFB(inText, categoryA, categoryB) {
      var retText = inText.replace(/attribute1/g, att1.name);
      retText = retText.replace(/attribute2/g, att2.name);
      retText = retText.replace(/categoryA/g, categoryA);
      retText = retText.replace(/categoryB/g, categoryB);
      return retText;
    }

    //Set the feedback messages.
    var messageDef = [
      { cut: '-0.65', message: getFB(piCurrent.fb_strong_Att1WithCatA_Att2WithCatB, cat1.name, cat2.name) },
      { cut: '-0.35', message: getFB(piCurrent.fb_moderate_Att1WithCatA_Att2WithCatB, cat1.name, cat2.name) },
      { cut: '-0.15', message: getFB(piCurrent.fb_slight_Att1WithCatA_Att2WithCatB, cat1.name, cat2.name) },
      { cut: '0.15', message: getFB(piCurrent.fb_equal_CatAvsCatB, cat1.name, cat2.name) },
      { cut: '0.35', message: getFB(piCurrent.fb_slight_Att1WithCatA_Att2WithCatB, cat2.name, cat1.name) },
      { cut: '0.65', message: getFB(piCurrent.fb_moderate_Att1WithCatA_Att2WithCatB, cat2.name, cat1.name) },
      { cut: '5', message: getFB(piCurrent.fb_strong_Att1WithCatA_Att2WithCatB, cat2.name, cat1.name) }
    ];
    var scoreMessageObject = { MessageDef: messageDef };
    if (piCurrent.manyErrors !== '') {
      scoreMessageObject.manyErrors = piCurrent.manyErrors;
    }
    if (piCurrent.tooFast !== '') {
      scoreMessageObject.tooFast = piCurrent.tooFast;
    }
    // if (piCurrent.notEnough !== '') {
    //   scoreMessageObject.notEnough = piCurrent.notEnough;
    // }
    //Set messages to the scorer.
    scorer.addSettings('message', scoreMessageObject);

    return API.script;
  }

  return iatExtension;
});
