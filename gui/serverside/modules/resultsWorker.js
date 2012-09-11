//resultsWorker

//GLOBALS======================================================================
var fs = require('fs');

//WORKER=======================================================================
process.on('message', function(msg){
	msg.answers.sort(inOrder);
	var answerString = formattedString(msg.answers);
	if(msg.overwrite){

	}
	else{
		fs.appendFileSync(msg.filepath, answerString);
	}
	process.send('done' : true);
});

//HELPERS======================================================================
function inOrder(a,b){
	var aLine = a[0][0].split(' '),
	bLine     = b[0][0].split(' ');
	if(aLine[0] > bLine[0]){
		return 1;
	}
	else if(aLine[0] < bLine[0]){
		return -1;
	}
	else if(aLine[aLine.length -1] > bLine[bLine.length - 1]){
		return 1;
	}
	else if(aLine[aLine.length -1] < bLine[bLine.length - 1]){
		return -1;
	}
	return 0;
}

function formattedString(data){
	var output = '';
	for (line in data){
		if(typeof data[line] == 'string'){
			output += data[line] + '\n';
		}
		else if(data[line] instanceof Array){
			output += formattedString(data[line]);
		}
	}
	return output;
}