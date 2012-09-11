//SETUP FOR MULTIPLE THREADS===================================================
var cluster = require('cluster'),
climber     = require('./climber.js'),
part1       = require('./part1.js'),
fs          = require('fs');

//look into this
process.setMaxListeners(0);

var deadcount = 0,
startcount    = 0;
//MASTER THREAD================================================================
if(cluster.isMaster){

	//EXPORTS==================================================================

	exports.climb = function(size, words, socket, filepath, overWrite, callback){
		var startTime = new Date().getSeconds();
		var answers = [],
		toList      = [];
		//Uses the size passed in to scale down the dictionary to only encompass
		//words of that length for when it is passed to the worker 'thread'
		//***MAKE SURE TO ALSO PRINT THE REVERSE OF THESE SO YOU ARE NOT MISSING ANY
		for(var i = 0; i < words.length - 1; i++){
			for(var j = i + 1; j < words.length; j++){
				if(words[i].length == size && words[j].length == size){
					toList.push(words[j]);
				}
			}
			//opens a 'thread' to process each word and all of its possible 
			//paths and kills it once it reports its results.
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
					//starts the worker
					worker.send({
						'start'  : words[i],
						'end'    : toList,
						'stage'  : '2a'
					});
					startcount++;
			}
			toList = [];
		}
		//Waits for all workers to be done, then processes the results and
		//displays them 
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
				//socket.emit('solution', answers);
				if(overWrite){
					//take option that overwrites file
					fs.writeFileSync(filepath, formattedString(answers));
					console.log('should be overwriting the old file');
				}
				else{
					console.log('should be writing the file out');
					fs.appendFileSync(filepath, formattedString(answers));
					if(callback){
						callback();
					}
				}
			}
	    });
	};
}
//WORKER THREAD================================================================
// This is not really a thread but rather a process. So it doesn't share     //
// memory with the main 'thread', and as it can't be passed circular objects //
// the dictionary has to be rebuilt each time a worker thread is spawned :/  //
// The only plus size is it is a scaled down version of the dictionary       //
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
	//Creating small dictionary of word objects.
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
		//Iterates through all of the possible start | end patterns and stores
		//the answers before returning them to the main 'thread'
		for(var i = 1; i < wordObjs.length; i++){
			console.log('Start: ' + msg.start);
			console.log('Finish: ' + wordObjs[i].value);
			var answer = climber.climb(msg.start , wordObjs[i].value, wordObjs, null, msg.stage, part1.linkWords);
			if(answer && answer[0]){
				//console.log(answer);
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

function formattedString(data){
	var output = '';
	for(line in data){
		output += data[line] + '\n';
	}
	return output;
}