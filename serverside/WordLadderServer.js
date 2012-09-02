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
io.sockets.on('connection', function(socket){
	var A = new Alphabet();
	console.log(A);

	

});

//CLIMBING ALGORITHM===========================================================

climb = function(start, end, dict){
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

	for(var i = 0; i < top.similar.length; i++){ //ISSUE 1
		var answer = solve(top, top, bottom, [], true, i);
		console.log(answer);
	}
};

//ISSUE 1) ONLY ITERATES THROUGH THE STARTING WORDS SIMILAR LIST SO IT DOESNT TEST
//EVERY POSSIBLE OUTCOME...STORE ANSWERS IN EACH LEVEL BEFORE RETURNING THEM?

//PASS IN AN OBJECT THAT HAS A CHANGEABLE FIELD THAT EACH LEVEL CAN CHANGE AND USE
//THAT VALUE INS A WHILE STATEMENT IN THE HEAD ONE...NOT STOPPING UNTIL IT IS CHANGED
//FOR GOOD...ONLY CHANGE IT FOR GOOD WHEN EVERY SIMILAR WORD IN EACH WORDS SIMILAR LIST
//HAS BEEN TRIED...OR MAYBE PUT IT INTO EACH WORD ITSELF

//ISSUE 2) INSIDE THE RECURSION WE ARE HAVING THE SAME ISSUE ON THE LOWER LEVEL

solve = function(current, start, target, checked, startFlag, startOffset){
	//console.log('CURRENT:: ' + current.value);
	if(current === target){
		return current.value;
	}
	else if((current === start && !startFlag) || (current.similar.length == 0)
		|| (checked.indexOf(current) != -1)){
		//console.log('DEAD END:: ' + current.value);
		return null;
	}
	else {
		checked.push(current);
		var answer = current.value,
		offset     = startFlag? startOffset : 0;
		for(var i = offset; i < current.similar.length;i++){ //ISSUE 2
			//console.log('CURRENTLY CHECKING:: ' + current.similar[i].value);
			var temp = solve(current.similar[i], start, target, checked, false);
			if(temp){
				//console.log('ANSWER:: ' + temp);
				answer += ' ' + temp;
				return answer; 
			}
		}
		return null;
	}
};

//CLASSES======================================================================

Letter = function(character){
	var self       = this;
	this.parents   = [];
	this.children  = [];
	this.character = character;
	this.addParent = function(p){
		if(typeof p == Letter){
			self.parents.push(p);
		}
	};
	this.addChild  = function(c){
		if(typeof c == Letter){
			self.children.push(c);
			c.addParent(this);
		}
	};
	this.character = function(){
		return self.character;
	};
	return this;
};

Alphabet = function(){
	var self   = this,
	characters = ['a','b','c','d','e','f','g','e','f','h','i','j','k','l',
	'm','n','o','p','q','r','s','t','u','v','w','x','y','z'];
	for(c in characters){
		self[characters[c]] = new Letter(characters[c]);
	}
	return this;
};

NestedBST = function(rootData){
	var self = this;
	this.root  = new BST(rootData);

	this.add = function(data){
		var child = new BST(data);
		self.root.addChild(child);
	};

	this.print = function(){
		var spaces = 0;
		console.log('\n' + 'Nested Tree:\n');
		self.root.print(0);
	}; 
};

BST = function(data){
	var self         = this;
	this.payLoad     = data;
	this.leftChild   = null;
	this.rightChild  = null;
	this.nestedRight = null;
	this.nestedLeft  = null;
	
	this.addChild   = function(child, nest){
		var left, right;
		if(nest){
			left  = 'nestedLeft';
			right = 'nestedRight';
		}
		else{
			left  = 'leftChild';
			right = 'rightChild'; 
		}
		if(child instanceof BST && child.payLoad){
			if(child.payLoad < self.payLoad){
				if(self[left]){
					self[left].addChild(child, nest);
				}
				else{
					self[left] = child;
				}
				return true;
			} 
			else{
				if(self[right]){
					self[right].addChild(child, nest);
				}
				else{
					self[right] = child;
				}
				return true;
			}
		}
		else if (!child || !child instanceof BST){
			console.log('ERROR:: Child must be an instance of BST.');
			return false;
		}
		else {
			console.log('ERROR:: Child has no data in its payload.');
			return false;
		}
	};

	this.addNestedChild = function(child){
		self.addChild(child, true);
	};

	this.print = function(spaces){
		var padding = '';
		for(var i = 0; i < spaces; i++){
			padding += '  ';
		}
		console.log(padding + self.payLoad + '\n');
		if(self.nestedLeft){
			self.nestedLeft.print(spaces + 1);
		}
		if(self.nestedRight){
			self.nestedRight.print(spaces + 1);
		}
		if(self.leftChild){
			self.leftChild.print(spaces + 1);
		}
		if(self.rightChild){
			self.rightChild.print(spaces + 1);
		}
	}

};

Dictionary = function(path){
	var file = fs.readFileSync(__dirname + path,'utf8'),
	//TODO FIGURE OUT HOW TO DETERMINE LIKE TERNIMNATION CHARACTER
	//words    = file.split('\r\n'),
	words    = file.split('\n'),
	self     = this,
	wordObjs = [];
	for(w in words){
		//store just words to be displayed to the client
		wordObjs.push(new Word(words[w]));
	}
	linkWords(wordObjs);
	//console.log(wordObjs); 
	return wordObjs;
};

Word = function(word){
	var self     = this;
	this.length  = word.length;
	this.value   = word;
	this.similar = [];
	this.link    = function(linkWord){
		if(!word instanceof Word){
			console.log('ERROR:: Cannot link a Word to a non-Word Object.');
		}
		else{
			self.similar.push(linkWord);
			linkWord.similar.push(self);
		}
	};
	return this;
};

//Testing

	var nbst = new NestedBST('c');
	nbst.add('a');
	nbst.add('u');
	//nbst.print();
	nbst.root.leftChild.addNestedChild(new BST('t'));
	nbst.root.leftChild.addNestedChild(new BST('p'));
	nbst.root.rightChild.addNestedChild(new BST('t'));
	nbst.root.rightChild.addNestedChild(new BST('p'));
	//nbst.print();

	var dict = new Dictionary('/../serverside/dictionary.txt');
	//climb('stone', 'money', dict);
	climb('cats', 'bark', dict);


//HELPERS======================================================================



function linkWords(array){
	for(var i = 0; i < array.length - 1; i++){
		for(var j = i + 1; j < array.length; j++){
			if(array[i].length == array[j].length && oneAway(array[i].value, array[j].value)){
				array[i].link(array[j]);
			}
		}
	}
};

function oneAway(stringA, stringB){
	var diff = 0;
	for(var i = 0; i < stringA.length; i++){
		if(stringA[i] !== stringB[i]){
			diff++;
		}
	}
	return diff == 1? true: false; 
};