//Global Variables=============================================================
var climber = require('./climber.js'),
part2a      = require('./wordladder').part2a(),
all         = [],
offset      = 0,
count       = 0;

//EXPORTS======================================================================

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
	socket.emit('expect', all.length);
	part2a.climb(all[offset][0].length, all[offset], socket, 
		 './part2b.txt', true, findNext);

	/*
	 * Makes the whole thing synchronous so that the different sized words get 		
	 * reported in order of length
	 */ 
	function findNext(solution){
		console.log('Moving to next set of words.');
		if(offset < all.length){
			socket.emit('solution', solution);
			offset++;
			part2a.climb(all[offset][0].length, all[offset], socket, 
				 './part2b.txt', false);
		}
		else{
			socket.emit('solution', 'this is just to test if it gets here');
			console.log('All Done.');
		}
	}
};


