//Global Variables=============================================================
var climber = require('./climber.js'),
part2a      = require('./wordladder').part2a(),
all         = [],
offset      = 0;

//EXPORTS======================================================================

/*
 * Section off all the words into arrays based on their length and then call 2a's 		
 * climb() giving it a call back to append the results from the next words to 		
 * the file and start on the next set of words or stop the whole cycle if its 		
 * done.
 */ 
exports.climb = function(dict, socket){
	dict.sort(function(a,b){
		if(a.value.length < b.value.length){
			return -1;
		}
		else if(b.value.length < a.value.length){
			return 1;
		}
	});
	var start = 0,
	temp      = [];
	for(var i = 0; i < dict.length; i++){
		if(dict[start].value.length == dict[i].value.length){
			temp.push(dict[i].value);
		}
		else{
			all.push(temp);
			temp = [];
			start = i;
			temp.push(dict[start].value);
		}
	}
	all.push(temp);
	part2a.climb(all[offset][0].length, all[offset], socket, 
		 './part2b.txt', false, findNext);

	/*
	 * Makes the whole thing synchronous so that the different sized words get 		
	 * reported in order of length
	 */ 
	function findNext(){
		console.log('Moving to next set of words.');
		if(offset < all.length){
			offset++;
			part2a.climb(all[offset][0].length, all[offset], socket, 
				 './part2b.txt', false);
		}
		else{
			console.log('All Done.');
		}
	}
};


