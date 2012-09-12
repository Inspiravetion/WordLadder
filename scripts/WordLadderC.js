var domain = document.domain,
socket = io.connect('http://' + domain + ':8000');
window.onload = function(){

//Socket Setup=================================================================

socket.on('solution', function(answers) {
	document.getElementById('solutions').innerText = answers;
	console.log(answers);
});

socket.emit('climb4');


}