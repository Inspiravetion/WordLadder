var socket = io.connect('http://127.0.0.1:8000');
window.onload = function(){

//Setup Buttons
document.getElementById('Climb').onclick = climb;

//functions

function climb(){
	alert('Climbing Word Ladder!');
}

}