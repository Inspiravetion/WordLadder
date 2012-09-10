//MULTITHREADING SETUP=========================================================
var cluster = require('cluster'),
touched     = [],
worker;

cluster.setupMaster({
  exec   : './modules/climbWorker.js',
  silent : false
});

//CLIMBING ALGORITHM===========================================================

/*
 * Takes a start/end string along with a dictionary object and starts the word 		
 * ladder climbing process by first getting a reference to the start/end Word 		
 * objects in the dictionary and then calling solve() with the last param as 		
 * 'true' to denote that it is the master caller.		
 * @param start is the string that should be at the top of the word ladder 		
 * @param end is the string that should be at the bottom of the word ladder 		
 * @param dict is the dictionary object that holds all the Word objects 
 */ 
exports.climb = function(start, end, dict, socket, stage){
	var startTime = new Date().getMilliseconds();
	var top, bottom;
	for(var i = 0; i < dict.length;i++){
		if(dict[i].value == start){
			top = dict[i];
			break;
		}
		// if(dict[i].value == end){
		// 	bottom = dict[i];
		// }
		// if(top && bottom){
		// 	break;
		// }
	}
	if(stage != '1'){
		worker = cluster.fork();
		worker.on('message', function(msg){
			if(msg.data){
				socket.emit('solution',msg.data);
				console.log('\nWorker destroyed...\n');
				this.destroy();
			}		
		});
	}
	console.log('about to solve...');
	var answer = solve(top, top, bottom, [], true, stage);
	// runOrDone(dict, start, stage);
	worker.send({kill: true});
	//worker.send({done : true});
	if(answer){
		answer.sort(function(a,b){
				if((a.split(' ').length) > (b.split(' ').length)){
					return 1;
				}
				else if((a.split(' ').length) < (b.split(' ').length)){
					return -1;
				}
				return 0;
		});
		if(stage == '1'){
			var endTime = new Date().getMilliseconds();
			console.log('\n\nTime Check: ' + (endTime - startTime) + ' milliseconds');
			socket.emit('solution', answer);
		}
		/*else if(stage == '2a'){
			return answer;
		}*/
	}
	else if(socket){
		socket.emit('nosolution');
	}
	//console.log(top);
	console.log('\n\n');
	//console.log(bottom);
};

/*
 * This is the recursive part of the solution. It takes in the current word 		
 * being assessed, the word to start with, the word to end with, an array 		
 * of words that have already been checked in the current path, and a boolean 		
 * flag denoting whether the caller is the top of the recursive stack. Then 		
 * checks if the current word is the target word, if the recursion should pop 		
 * back(hits the start word, current word has no similar words, or current 		
 * word has already been checked). If not, the method is called recursively 		
 * until all the possible paths have been explored/reported. 		
 * @param current is the current Word object being assessed 		
 * @param start is the Word object that is at the top of the word ladder 		
 * @param target is the Word object that is at the end of the word ladder		
 * @param checked is an array of all the checked words in the word ladder path 		
 * @param startFlag is a boolean that denotes whether the caller is the first 		
 * one in the recursive call
 */ 	
solve = function(current, start, target, checked, startFlag, stage){
	/*if(current === target){
		return [current.value];
	}*/
	 if((current === start && !startFlag) || (current.similar.length == 0)
		|| (checked.indexOf(current) != -1)){
		return null;
	}
	else {
		//WIDDLE THIS DOWN DO THERE ARE NO REPEATS...MIGHT HAVE TO ADD EXTRA 
		//FIELDS IN WORD OBJECTS
		checked.push(current);
		var allAnswers = [];
		while (!current.doneChecking()){
			var similarW = current.similar[current.getOffset()],
			recAnswer    = solve(similarW, start, target, checked, false);
			current.checkedNext();
			if(recAnswer){
				for(a in recAnswer){
					var newAnswer = current.value + ' ' + recAnswer[a];
					allAnswers.push(newAnswer);
					if(stage != '1'){
						worker.send({'data': newAnswer});
					}
				}
			}
			else{
				allAnswers.push([current.value]);
			}
		}
		if(!contains(current.value, touched)){
			touched.push(current.value);
		}
		current.reset();
		remove(current, checked);
		return allAnswers.length != 0? allAnswers : null;
	}
};

//HELPERS======================================================================

/*function runOrDone(dict, start, stage){
	var checkMe;
	for(var i = 0; i < dict.length; i++){
		if(dict[i].value.length == start.length &&
			!contains(dict[i].value, touched)){
			checkMe = dict[i];
			break;
		}
	}
	if(checkMe){
		console.log('now checking ' + checkMe.value)
		//console.log(touched);
		touched.push(checkMe.value);
		solve(checkMe, null, null, [], true, stage);
		runOrDone(dict, start, stage);
	}
	else{
		worker.send({kill : true});
	}
}*/

/*
 * Removes the given value from the given array		
 * @param val is the value to be removed		
 * @param array is the array that val should be removed from
 */ 
function remove(val, array) {
	if(array.indexOf(val) != -1){
		array.splice(array.indexOf(val), 1);
		return true;
	}
	return false;
}

/*
 * Returns whether the value is contained in the array or not.
 * @param val the value to be tested 		
 * @param array  the array to test in 		
 * @return a boolean of whether the value is in the array.
 */ 
function contains(val, array){
	return (array.indexOf(val) != -1);
}
