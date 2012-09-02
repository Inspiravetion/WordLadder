var socket = io.connect('http://127.0.0.1:8000');
window.onload = function(){

//Setup Buttons================================================================
document.getElementById('Climb').onclick = climb;

//wont need this when the list is dynamically added
var wordlist = document.getElementById('wordlist'),
    words    = wordlist.getElementsByClassName('styledListElement'),
    from     = document.getElementById('fromlabel'),
    to       = document.getElementById('tolabel'),
    fromto   = 0;

	for(w in words){ 
		words[w].onclick = setLadderPoles;
	};

//functions====================================================================

function climb(){
	var start = document.getElementById('fromlabel').innerText.split('From: ')[1],
	end       = document.getElementById('tolabel').innerText.split('To: ')[1];
	socket.emit('climb', {'start': start, 'end': end});
}

function setLadderPoles(e){ 
	if(fromto == 0){
		from.innerText = 'From: ' + e.target.innerText;
		fromto++;
	}
	else{
		to.innerText = 'To: ' + e.target.innerText;
		fromto = 0;
	}
}

//Socket Setup=================================================================

socket.on('wordlist', function(array){
	var wordContainer  = document.getElementById('wordlistcontainer');
	for (a in array){
		var word       = document.createElement('p');
		word.innerText = array[a];
		word.setAttribute('class', 'styledListElement');
		word.onclick   = setLadderPoles;
		wordContainer.appendChild(word);
	}
});

}