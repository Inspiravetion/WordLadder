var fs = require('fs');
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
exports.climb = function(start, end, dict, socket, stage, filepath){
	var startTime = new Date().getMilliseconds();
	var top, bottom;
	for(var i = 0; i < dict.length;i++){
		if(dict[i].value == start){
			top = dict[i];
		}
		if(dict[i].value == end){
			bottom = dict[i];
		}
		if(top && bottom){
			break;
		}
	}
	var answer = solve(top, top, bottom, [], true);
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
			var out = '';
			for(a in answer){
				out += answer[a] + '\n';
			}
			fs.writeFileSync(filepath, out);
		}
		else if(stage == '2a'){
			return answer;
		}
	}
	else if(socket){
		socket.emit('nosolution');
	}
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
solve = function(current, start, target, checked, startFlag){
	if(current === target){
		return [current.value];
	}
	else if((current === start && !startFlag) || (current.similar.length == 0)
		|| (checked.indexOf(current) != -1)){
		return null;
	}
	else {
		checked.push(current);
		var allAnswers = [];
		while (!current.doneChecking()){
			var similarW = current.similar[current.getOffset()],
			recAnswer    = solve(similarW, start, target, checked, false);
			current.checkedNext();
			if(recAnswer){
				for(a in recAnswer){
					allAnswers.push(current.value + ' ' + recAnswer[a]);
				}
			}
		}
		current.reset();
		remove(current, checked);
		return allAnswers.length != 0? allAnswers : null;
	}
};

//HELPERS======================================================================

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
