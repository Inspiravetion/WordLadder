var domain = document.domain,
socket = io.connect('http://' + domain + ':8000');
window.onload = function(){

//Setup Buttons================================================================
document.getElementById('Climb').onclick = climb;

//wont need this when the list is dynamically added
var wordlist = document.getElementById('wordlist'),
    from     = document.getElementById('fromlabel'),
    to       = document.getElementById('tolabel'),
    fromto   = 0;

//functions====================================================================

function climb(){
	var start = document.getElementById('fromlabel').innerText.split('From: ')[1],
	end       = document.getElementById('tolabel').innerText.split('To: ')[1];
	socket.emit('climb1', {'start': start, 'end': end});
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

function topThree(array){
	var first = array[0]? array[0].split(' ') : '',
	second    = array[1]? array[1].split(' ') : '',
	third     = array[2]? array[2].split(' ') : '',
	firstElem = document.getElementById('first'),
	secElem   = document.getElementById('second'),
	thirdElem = document.getElementById('third'),
	counter   = 1;
	firstElem.innerText = '';
	secElem.innerText = '';
	thirdElem.innerText = '';
	for(f in first){
		firstElem.innerText += counter + '. ' + first[f] + '\n';
		counter++;
	}
	counter = 1;
	for(s in second){
		secElem.innerText += counter + '. ' + second[s] + '\n';
		counter++;
	}
	counter = 1;
	for(t in third){
		thirdElem.innerText += counter + '. ' + third[t] + '\n';
		counter++;
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

socket.on('solution', function(answers) {
	var answersContainer = document.getElementById('answersContainer');
	ladder.removeChildren(answersContainer);
	topThree(answers.slice(0,3));
	document.getElementById('allsolutions').innerText = 'All Possibilities (' 
		+ answers.length + ')';
	for(var i = 3; i < answers.length; i++){
		var answer       = document.createElement('p'),
		answerArray      = answers[i].split(' ');
		answer.onclick   = ladder.showAnswer;
		answer.answer    = answerArray;
		answer.innerText = answerArray.length + 'Rungs';
		answer.setAttribute('class', 'styledListElement');
		answersContainer.appendChild(answer);
	}
});

socket.emit('wordlist');

}