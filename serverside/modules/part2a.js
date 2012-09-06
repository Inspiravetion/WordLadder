//SETUP FOR MULTIPLE THREADS===================================================
var cluster = require('cluster'),
climber     = require('./climber.js'),
part1       = require('./part1.js');

var deadcount = 0,
startcount    = 0;
//MASTER THREAD================================================================
if(cluster.isMaster){

	//EXPORTS==================================================================

	exports.climb = function(size, words, dict, socket){
		var startTime = new Date().getSeconds();
		var answers = [],
		toList      = [];
		for(var i = 0; i < words.length - 1; i++){
			for(var j = i + 1; j < words.length; j++){
				if(words[i].length == size && words[j].length == size){
					toList.push(words[j]);
				}
			}
			if(words[i].length == size){
				var worker = cluster.fork();
					worker.on('message', function(msg) {
						if(msg.answer){
							answers.push(msg.answer);
							this.destroy();
						}
					});
					worker.send({
						'start'  : words[i],
						'end'    : toList,
						'dict'   : dict,
						'socket' : null,
						'stage'  : '2a'
					});
					startcount++;
			}
			toList = [];
		}
		cluster.on('disconnect', function(){
			deadcount++;
			if(isEmpty(cluster.workers)){
				//this sort is not working correctly
				/*answers.sort(function(a,b){
						if(a[0][0] > b[0][0]){
							return 1;
						}
						else if(a[0][0] < b[0][0]){
							return -1;
						}
						else if(a[0][a.length -1] > b[0][b.length - 1]){
							return 1;
						}
						else if(a[0][a.length -1] < b[0][b.length - 1]){
							return -1;
						}
						return 0;
				});*/
				var endTime = new Date().getSeconds();
				//console.log(answers);
				//socket.emit('solution', answers);
			    console.log('\n\nTime Check: ' + (endTime - startTime) + ' milliseconds');
			}
	    });
	};
}
//WORKER THREAD================================================================
else{

	Word = function(word){
	var self     = this;
	this.length  = word.length;
	this.value   = word;
	this.offset  = 0;
	this.similar = [];
	this.link    = function(linkWord){
		if(!word instanceof Word){
			console.log('ERROR:: Cannot link a Word to a non-Word Object.');
			return false;
		}
		self.similar.push(linkWord);
		linkWord.similar.push(self);
		return true;
	};
	this.checkedNext = function(){
		self.offset++;
	};
	this.doneChecking = function(){
		return self.similar.length == self.offset;
	};
	this.getOffset = function(){
		return self.offset;
	};
	this.reset = function(){
		self.offset = 0;
	};
	return this;
};
	var self = this;
	process.on('message', function(msg) {
		var wordObjs = [],
		answers      = [];
		wordObjs.push(new Word(msg.start));
		for(word in msg.end){
			var w = new Word(msg.end[word]);
			wordObjs.push(w);
		}
		part1.linkWords(wordObjs);
		for(var i = 1; i < wordObjs.length; i++){
			var answer = climber.climb(msg.start , wordObjs[i].value, wordObjs, msg.socket, msg.stage, part1.linkWords);
			if(answer){
				answers.push(answer);
			}
		}
		process.send({'answer': answers});
	});

	/*PASS IN ALL OF THE WORDS OF A SPECIFIC LENGTH AND HAVE IT MAKE THEM INTO 
	A SMALLER DICTIONARY...THEN LINK THEM GIVEN THE PASSED IN LINKER METHOD AND 
	SOLVE ALL OF THOSE LADDERS OF THAT LENGTH IN THEIR OWN THREAD.*/
}

//HELPERS======================================================================

var isEmpty = function(obj) {
  return Object.keys(obj).length === 0;
}