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


});

//CLIMBING ALGORYTHM===========================================================



//HELPERS======================================================================