//HTTP SERVER SETUP============================================================
var http         = require('http'),
	fs           = require('fs'),
	server       = http.createServer(reqHandler).listen(8000),
	url          = require('url'),
	io           = require('socket.io').listen(server),
	services;

function reqHandler(req, res) {
    var request = url.parse(req.url, true),
        action  = request.pathname,
        output  = processAction(action);
    if (output) {
    	res.writeHead(200, 
    		{
    	    'Content-Type'                : output.mimeType,
    		'Access-Control-Allow-Origin' : '*',
    		'Access-Control-Allow-Methods': 'POST' 
    		}
    	);
    	res.end(output.data);
    }
    else{
    	res.writeHead(500);
    	res.end('Something went wrong...');
    }    
}

function processAction(action){
	console.log('Processing action...')
	for (var i = 0; i < services.length; i++) {	
		if (action == services[i].identifier) {
	        var data = services[i].service(),
	        type     = services[i].mimeType;
	        return {'data': data, 'mimeType': type};
	    }
	}
	return false;
}

services = [
	{'identifier': '/wordladder'                                ,'service': wordladder    ,'mimeType': 'text/html'       },
	{'identifier': '/bootstrap/js/bootstrap.min.js'             ,'service': bootstrapJS   ,'mimeType': 'text/javascript' },
	{'identifier': '/scripts/WordLadderA.js'                    ,'service': wordladderAJS ,'mimeType': 'text/javascript' },
	{'identifier': '/bootstrap/css/bootstrap.min.css'           ,'service': bootstrapCSS  ,'mimeType': 'text/css'        },
	{'identifier': '/bootstrap/css/bootstrap-responsive.min.css','service': bootstrapRCSS ,'mimeType': 'text/css'        }
];

function wordladder() {
	var output = fs.readFileSync(__dirname + '/../WordLadder.html');
	return output;
}

function bootstrapJS() {
	var output = fs.readFileSync(__dirname + '/../bootstrap/js/bootstrap.min.js');
	return output;
}

function wordladderAJS() {
	var output = fs.readFileSync(__dirname + '/../scripts/WordLadderA.js');
	return output;
}

function bootstrapCSS() {
	var output = fs.readFileSync(__dirname + '/../bootstrap/css/bootstrap.min.css');
	return output;
}

function bootstrapRCSS() {
	var output = fs.readFileSync(__dirname + '/../bootstrap/css/bootstrap-responsive.min.css');
	return output;
}

//SOCKET SETUP=================================================================
var wordlist = [];
io.sockets.on('connection', function(socket){

	socket.on('climb', function(params) {
		climb(params.start, params.end, dict);
	});

	socket.emit('wordlist', wordlist);



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
climb = function(start, end, dict){
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
	//reporting the results...this will change
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
		for(a in answer){
			console.log(answer[a] + '');
		}
		var endTime = new Date().getMilliseconds();
		console.log('\n\nTime Check: ' + (endTime - startTime) + ' milliseconds');
		socket.emit('solution', answer);
	}
	else{
		socket.emit('solution', ['No Answer.', 'No Answer.', 'No Answer.']);
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

});

//CLASSES======================================================================

Dictionary = function(path){
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
	linkWords(wordObjs);
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

//Testing

	var dict = new Dictionary('/../serverside/short_dictionary.txt');


//HELPERS======================================================================


/*
 * Bi-directionally links two Word objects that are one letter away from 
 * eachother so that they have references to eachother for the climbing process		
 * @param array is an Array of Word objects (Dictionary)
 */ 
function linkWords(array){
	for(var i = 0; i < array.length - 1; i++){
		for(var j = i + 1; j < array.length; j++){
			if(array[i].length == array[j].length && oneAway(array[i].value, array[j].value)){
				array[i].link(array[j]);
			}
		}
	}
};

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