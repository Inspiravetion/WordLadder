var self = this,
cluster  = require('cluster');

console.log('Worker Started');
var data = [];
process.on('message', function(msg){
	console.log('from worker:' + msg.data);
	data.push(msg.data);
	process.send({'data' : data});
});

/*process.on('exit', function(){
	process.send({'data' : 'the connection is ended'});
	console.log('the connection is ended');
});*/

