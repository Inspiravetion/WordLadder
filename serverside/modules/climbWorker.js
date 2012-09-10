var self = this,
cluster  = require('cluster'),
data     = [];

console.log('Worker Started');

process.on('message', function(msg){
	console.log(msg);
	if(msg.kill){
		process.send({'data' : data});
	}
	else{
		data.push(msg.data);
	}
});

