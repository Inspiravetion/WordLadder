//GLOBALS======================================================================
var start, end, length,
fs = require('fs'),
wordlist = [],
ladder = require('./modules/wordladder'),
part1  = ladder.part1();
console.log('Started up.');




//CLASSES======================================================================

Dictionary = function(path, linker){
	var file = fs.readFileSync(__dirname + path,'utf8'),
	//TODO FIGURE OUT HOW TO DETERMINE LIKE TERNIMNATION CHARACTER
	words    = file.split('\r\n'),
	//words    = file.split('\n'),
	self     = this,
	wordObjs = [];
	for(w in words){
		wordObjs.push(new Word(words[w]));
		wordlist.push(words[w]);
	}
	linker(wordObjs);
	return wordObjs;
};

/*
 * Creates a Word object from a string. The word object has methods and 		
 * functions to help calculate the word ladders.		
 * @param word is the string word that the Word object is to represent
 * @return a Word object
 */ 	
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


//RUNNING IT===================================================================
var input = fs.readFileSync('./input.txt', 'utf8').split('\n');
start     = input[0];
end       = input[1];
length    = parseInt(input[2]);

var dict1 = new Dictionary('/short_dictionary.txt', part1.linkWords);
part1.climb(start, end, dict1, './part1.txt');
console.log('File created.\nShutting down...');


//Helpers======================================================================

/*
 * Returns whether the value is contained in the array or not.
 * @param val the value to be tested 		
 * @param array  the array to test in 		
 * @return a boolean of whether the value is in the array.
 */ 
function contains(val, array){
	return (array.indexOf(val) != -1);
}
