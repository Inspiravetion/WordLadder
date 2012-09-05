var socket = io.connect('http://127.0.0.1:8000');
window.onload = function(){

//Setup Buttons================================================================


//functions====================================================================


//Socket Setup=================================================================

socket.on('sizelist', function(array){
	array.sort(function(a,b){
		if(a > b){
			return 1;
		}
		else if(a < b){
			return -1;
		}
		return 0;
	});
	var sizeContainer  = document.getElementById('size-List');
	for (a in array){
		var word       = document.createElement('p');
		word.innerText = array[a];
		word.setAttribute('class', 'styledListElement');
		//word.onclick   = setLadderPoles; THIS WILL HAVE TO BE DIFFERENT...LADDER.STARTCLIMBINGANIMATION()?
		sizeContainer.appendChild(word);
	}
});

/*socket.on('solution', function(answers) {
	var answersContainer = document.getElementById('answersContainer');
	removeChildren(answersContainer);
	topThree(answers.slice(0,3));
	document.getElementById('allsolutions').innerText = 'All Possibilities (' 
		+ answers.length + ')';
	for(var i = 3; i < answers.length; i++){
		var answer       = document.createElement('p'),
		answerArray      = answers[i].split(' ');
		answer.onclick   = showAnswer;
		answer.answer    = answerArray;
		answer.innerText = answerArray.length + 'Rungs';
		answer.setAttribute('class', 'styledListElement');
		answersContainer.appendChild(answer);
	}
});*/

socket.emit('sizelist');

}