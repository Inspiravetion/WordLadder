//Global Variables=============================================================
var climber = require('./climber.js');

//EXPORTS======================================================================

exports.climb = function(start, end, dict, socket){
	climber.climb(start,end, dict, socket, '2b');
};

/*
 * Bi-directionally links two Word objects that are one letter away from 
 * eachother so that they have references to eachother for the climbing process		
 * @param array is an Array of Word objects (Dictionary)
 */ 
exports.linkWords = function(array){
	for(var i = 0; i < array.length - 1; i++){
		for(var j = i + 1; j < array.length; j++){
			if(oneAway(array[i].value, array[j].value)){
				array[i].link(array[j]);
			}
		}
	}
};

//HELPERS======================================================================

/*
 * Checks to see if the two words are 1 character away from eachother or not 		
 * @param stringA is the first string to be compared 		
 * @param stringB is the second string to be compared
 */ 
function oneAway(stringA, stringB){
	var diff = 0;
	for(var i = 0; i < stringA.length; i++){
		if(stringA[i] !== stringB[i]){
			diff++;
		}
	}
	return diff == 1? true: false; 
};  