//Global Variables=============================================================
var climber = require('./climber.js'),
part2a      = require('./wordladder').part2a(),
all         = [],
offset      = 0;

//EXPORTS======================================================================

exports.climb = function(dict, socket){
	//store all of the possibilities in all...have the length be the property etc. all.['' + 1] = []
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
	// console.log(all);
	//call part2a's climb for all lengths passing it a callback
		//could also just pass it the path to the file and have it append to it
			//if you did this you would have to add an append vs. overwrite flag ro 2a
	//when you get the answers back, store them so that you can send them when someone connects..
		//nevermind thats stupid cuz you can have 2a's climb do all the work and report the answers in order

	
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


