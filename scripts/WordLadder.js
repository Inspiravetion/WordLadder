var socket = io.connect('http://127.0.0.1:8000');
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

function showAnswer(e){
	removeChildren(document.getElementById('modalmessage'));
	$('#myModal').modal({
    	keyboard: false,
    	backdrop: 'false'
	});
	var header = document.getElementById('modalheader');
	header.innerText = e.target.answer[0] + ' -> ' + e.target.answer[e.target.answer.length - 1];
	startClimbingAnimation(e.target.answer);
}

function removeChildren(domNode){
	while(domNode.hasChildNodes()){
		domNode.removeChild(domNode.lastChild);
	}
}

function getRung(start, end){
	for(var i = 0; i < start.length; i++){
		if(start[i] !== end[i]){
			return {'index' : i, 'letter' : end[i]};
		}
	}
}

//Climbing Transition Animation================================================
function startClimbingAnimation(answer){
	var START = answer[0];

	//setup
	for(var i = 0; i < START.length; i++){
	    var div = document.createElement('div');
	    div.innerText = START[i];
	    div.setAttribute('class', 'flexchild');
	    div.id = 'climbingChar' + i;
	    document.getElementById('modalmessage').appendChild(div);
	}

	function climbTransition(changeIndex, changeChar){
	    var count = 0,
	        opa   = 1,
	        timer = setInterval(function(){
	            if(count != 50){
	                document.getElementById('climbingChar' + changeIndex).style.opacity = opa;
	                count++;                    
	                opa -= .02;
	            }
	            else{
	                document.getElementById('climbingChar' + changeIndex).style.opacity = 0;
	                clearInterval(timer);
	                setTimeout(function(){
	                    fadeIn('climbingChar' + changeIndex, changeChar);
	                }, 500);
	            }
	        }, 10);
	}
	    
	function fadeIn(from, to){
	    document.getElementById(from).innerText = to;
	var count2 = 0,
	    opa2   = 0,
	    timer = setInterval(function(){
	        if(count2 != 50){
	            document.getElementById(from).style.opacity = opa2;
	            count2++;                    
	            opa2 += .02;
	        }
	        else{
	            document.getElementById(from).style.opacity = 1;
	            clearInterval(timer);
	        }
	    }, 10);
	}

	var rungCount = 0,
	headTimer = setInterval(function(){
		if (rungCount < answer.length - 1) {
			var rung = getRung(answer[rungCount], answer[rungCount + 1]);
			climbTransition(rung.index, rung.letter);
			rungCount++;
		}
		else{
			clearInterval(headTimer);
		}
	}, 2000);

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
});

}