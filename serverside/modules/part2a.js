//SETUP FOR MULTIPLE THREADS===================================================
var cluster = require('cluster'),
climber     = require('./climber.js'),
part1       = require('./part1.js');

//MASTER THREAD================================================================
if(cluster.isMaster){

	//EXPORTS==================================================================

	exports.climb = function(size, words, dict, socket){
		var startTime = new Date().getMilliseconds();
		var answers = [];
		for(var i = 0; i < words.length - 1; i++){
			for(var j = i + 1; j < words.length; j++){
				if(words[i].length == size && words[j].length == size){
					//gotta check that all the workers havent killed themselves yet
					//thats when you know you are done
					var worker = cluster.fork();
					worker.on('message', function(msg) {
						if(msg.answer){
							answers.push(msg.answer);
							worker.destroy();
						}
					});
					worker.send({
						'start'  : words[i],
						'end'    : words[j],
						'dict'   : dict,
						'socket' : null,
						'stage'  : '2a'
					});
				}
			}
		}
		cluster.on('disconnect', function(){
			if(isEmpty(cluster.workers)){
				//this sort is not working correctly
				answers.sort(function(a,b){
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
				});
				var endTime = new Date().getMilliseconds();
				socket.emit('solution', answers);
			    console.log('\n\nTime Check: ' + (endTime - startTime) + ' milliseconds');
			}
	    });
	};
}
//WORKER THREAD================================================================
else{
	process.on('message', function(msg) {
		var answer = climber.climb(msg.start , msg.end, msg.dict, msg.socket, msg.stage, part1.linkWords);
		process.send({'answer': answer});
	});

	/*PASS IN ALL OF THE WORDS OF A SPECIFIC LENGTH AND HAVE IT MAKE THEM INTO 
	A SMALLER DICTIONARY...THEN LINK THEM GIVEN THE PASSED IN LINKER METHOD AND 
	SOLVE ALL OF THOSE LADDERS OF THAT LENGTH IN THEIR OWN THREAD.*/
}

//HELPERS======================================================================

var isEmpty = function(obj) {
  return Object.keys(obj).length === 0;
}