var self = this,
cluster  = require('cluster'),
fs       = require('fs'),
data     = [],
touched  = [];

console.log('Worker Started');

process.on('message', function(msg){
	if(msg.kill){
		sort();
		//process.send({'data' : data});
		fs.appendFileSync('output.txt', getFormattedString());
	}
	else{
		if(!contains(msg.data, data)){
			data.push(msg.data);		
		}
	}
});

function sort(){
	data.sort(function(a,b){
		var lineA = a.split(' '),
		lineB     = b.split(' ');
		if(lineA[0] < lineB[0]){
			return -1;
		}
		else if(lineB[0] < lineA[0]){
			return 1;
		}
		else if(lineA[lineA.length -1] < lineB[lineB.length -1]){
			return -1;
		}
		else if(lineB[lineB.length -1] < lineA[lineA.length - 1]){
			return 1;
		}
		else if(lineA.length < lineB.length){
			return -1;
		}
		else if(lineB.length < lineA.length){
			return 1;
		}
		return 0;
	});
}

function getFormattedString(){
	var output = '';
	for(line in data){
		output += data[line] + '\n';
	}
	return output;
}

/*
 * Returns whether the value is contained in the array or not.
 * @param val the value to be tested 		
 * @param array  the array to test in 		
 * @return a boolean of whether the value is in the array.
 */ 
function contains(val, array){
	return (array.indexOf(val) != -1);
}
