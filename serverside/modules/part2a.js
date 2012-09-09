//SETUP FOR MULTIPLE THREADS===================================================
var cluster = require('cluster'),
climber     = require('./climber.js'),
part1       = require('./part1.js');

var deadcount = 0,
startcount    = 0;
//MASTER THREAD================================================================
if(cluster.isMaster){

	//EXPORTS==================================================================

	exports.climb = function(size, words, socket){
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
							if(msg.answer.length != 0){
								answers.push(msg.answer);
							}
							this.destroy();
						}
					});
					worker.send({
						'start'  : words[i],
						'end'    : toList,
						'stage'  : '2a'
					});
					startcount++;
			}
			toList = [];
		}
		cluster.on('disconnect', function(){
			if(isEmpty(cluster.workers)){
				answers.sort(function(a,b){
					var aLine = a[0][0].split(' '),
					bLine     = b[0][0].split(' ');
						if(aLine[0] > bLine[0]){
							return 1;
						}
						else if(aLine[0] < bLine[0]){
							return -1;
						}
						else if(aLine[aLine.length -1] > bLine[bLine.length - 1]){
							return 1;
						}
						else if(aLine[aLine.length -1] < bLine[bLine.length - 1]){
							return -1;
						}
						return 0;
				});
				socket.emit('solution', answers);
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
			var answer = climber.climb(msg.start , wordObjs[i].value, wordObjs, null, msg.stage, part1.linkWords);
			if(answer && answer[0]){
				console.log(answer);
				answers.push(answer);
			}
		}
		process.send({'answer': answers});
	});
}

//HELPERS======================================================================

var isEmpty = function(obj) {
  return Object.keys(obj).length === 0;
}