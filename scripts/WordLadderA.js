var socket = io.connect('http://127.0.0.1:8000');
window.onload = function(){



//Setup Buttons================================================================


//functions====================================================================

accordianFactory = function(){
	var aCount = 0,
	groupCount = 0,
	self       = this;

	this.createAccordianGroup = function(header, body){
		var aGroup = document.createElement('div');
		aGroup.setAttribute('class', 'accordian-group');

		var aHeading = document.createElement('div');
		aHeading.setAttribute('class', 'accordian-heading');

		var aToggle = document.createElement('a');
		aToggle.setAttribute('class', 'accordian-toggle');
		aToggle.setAttribute('data-toggle', 'collapse');
		aToggle.setAttribute('data-parent', '#accordian' + aCount);
		aToggle.setAttribute('href', '#collapse' + groupCount);
		aToggle.innerText = header;

		var aBody = document.createElement('div');
		aBody.setAttribute('class', 'accordian-body');
		aBody.setAttribute('class', 'collapse');
		aBody.setAttribute('class', 'in');
		aBody.id = 'collapse' + groupCount;

		var aInner = document.createElement('div');
		aInner.setAttribute('class', 'accordian-inner');
		aInner.innerText = body;

		aBody.appendChild(aInner);
		aHeading.appendChild(aToggle);
		aGroup.appendChild(aHeading);
		aGroup.appendChild(aBody);

		groupCount++;

		return aGroup;
	};

	this.createAccordian = function(child, parent){
		var accordian = document.createElement('div');
		accordian.setAttribute('class', 'accordian');
		accordian.id = 'accordian' + aCount;

		aCount++;

		accordian.appendChild(child);
		parent.appendChild(accordian);
	};


	return this;

};


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

socket.on('solution', function(answers) {
	var answersContainer = document.getElementById('size-solutions');
	ladder.removeChildren(answersContainer);
	/*document.getElementById('allsolutions').innerText = 'All Possibilities (' 
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
	console.log(answers);*/

	var child = aFactory.createAccordianGroup('Test Header', 'Test Body...');
	aFactory.createAccordian(child, answersContainer);

});

socket.emit('sizelist');


//Globals======================================================================
var aFactory = new accordianFactory();

}