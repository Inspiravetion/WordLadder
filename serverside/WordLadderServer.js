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
		var tester = new RegExp('.*' + services[i].identifier);
		if (action.match(tester)) {
	        var data = services[i].service(),
	        type     = services[i].mimeType;
	        return {'data': data, 'mimeType': type};
	    }
	}
	return false;
}

services = [
	{'identifier': '/wordladder/1'                                ,'service': wordladder    ,'mimeType': 'text/html'       },
	{'identifier': '/wordladder/2a'                             ,'service': wordladder2a  ,'mimeType': 'text/html'       },	
	{'identifier': '/bootstrap/js/bootstrap.min.js'             ,'service': bootstrapJS   ,'mimeType': 'text/javascript' },
	{'identifier': '/scripts/WordLadder.js'                     ,'service': wordladderJS  ,'mimeType': 'text/javascript' },
	{'identifier': '/scripts/WordLadderA.js'                    ,'service': wordladderAJS ,'mimeType': 'text/javascript' },
	{'identifier': '/scripts/Ladder.js'                         ,'service': ladderJS      ,'mimeType': 'text/javascript' },
	{'identifier': '/socket.io/socket.io.js'                    ,'service': socketIOJS    ,'mimeType': 'text/javascript' },
	{'identifier': '/bootstrap/css/bootstrap.min.css'           ,'service': bootstrapCSS  ,'mimeType': 'text/css'        },
	{'identifier': '/bootstrap/css/bootstrap-responsive.min.css','service': bootstrapRCSS ,'mimeType': 'text/css'        }
];

function wordladder() {
	var output = fs.readFileSync(__dirname + '/../WordLadder.html');
	return output;
}

function socketIOJS(argument) {
	var output = fs.readFileSync(__dirname + '/../scripts/socket.io.min.js');
	return output;
}

function wordladder2a() {
	var output = fs.readFileSync(__dirname + '/../WordLadder2a.html');
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

function wordladderJS() {
	var output = fs.readFileSync(__dirname + '/../scripts/WordLadder.js');
	return output;
}

function ladderJS() {
	var output = fs.readFileSync(__dirname + '/../scripts/Ladder.js');
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

io.sockets.on('connection', function(socket){

	socket.on('climb1', function(params) {
		part1.climb(params.start, params.end, dict1, socket);
	});

	socket.on('climb2', function(size){
		part2.climb(size, wordlist, dict1, socket);
	});

	socket.on('sizelist', function(){
		socket.emit('sizelist', sizelist);
	});

	socket.on('wordlist', function(){
		socket.emit('wordlist', wordlist);
	});

});

//GLOBAL VARIABLES=============================================================

var wordlist = [],
sizelist     = [];

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
		if(!contains(words[w].length, sizelist)){
			sizelist.push(words[w].length);
		}
	}
	//linker(wordObjs);
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



//MODULE SETUP=================================================================
var part1 = require('./modules/wordladder').part1(),
dict1 = new Dictionary('/short_dictionary.txt', part1.linkWords);

var part2 = require('./modules/wordladder').part2a();




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


