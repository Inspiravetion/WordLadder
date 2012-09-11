//GLOBAL VARIABLES=============================================================

//EXPORTS======================================================================

exports.climb = function(start, socket){
	if(start.similar.length != 0){
		var output = start.value + ' ';
		for( s in start.similar){
			output += start.similar[s].value + ' ';
		}
		return output;
	}
};

/*
 * Bi-directionally links two Word objects that are +/- one letter from eachother
 * eachother so that they have references to eachother for the climbing process		
 * @param array is an Array of Word objects (Dictionary)
 */ 
exports.linkWords = function(array){
	for(var i = 0; i < array.length - 1; i++){
		for(var j = i + 1; j < array.length; j++){
			if(Math.abs(array[i].length - array[j].length) == 1 && 
				sameOrder(array[i].value, array[j].value)){
				array[i].link(array[j]);
			}
		}
	}
};

//HELPERS======================================================================

function sameOrder(a, b){
	var offset = 0, small, big;
	if(a.length <= b.length){
		small = a;
		big   = b;
	}
	else{
		small = b;
		big   = a;
	}
	for(var i = 0; i < small.length; i++){
		if(offset == 0){
			if(small[i] != big[i] && small[i] == big[i + 1]){
				offset = 1;
			}
			else if(small[i] != big[i] && small[i] != big[i + 1]){
				return false;
			}
		}
		else{
			if(small[i] != big[i + 1]){
				return false;
			}
		}
	}
	return true;
};
