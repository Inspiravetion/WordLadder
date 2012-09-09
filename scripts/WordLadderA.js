var domain = document.domain,
socket = io.connect('http://' + domain + ':8000');
window.onload = function(){



//Setup Buttons================================================================


//functions====================================================================

accordionFactory = function(){
	var aCount = 0,
	groupCount = 0,
	self       = this;

	this.createAccordionGroup = function(header, body){
		var aGroup = document.createElement('div');
		aGroup.setAttribute('class', 'accordion-group');

		var aHeading = document.createElement('div');
		aHeading.setAttribute('class', 'accordion-heading');

		var aToggle = document.createElement('a');
		aToggle.setAttribute('class', 'accordion-toggle');
		aToggle.setAttribute('data-toggle', 'collapse');
		aToggle.setAttribute('data-parent', '#accordion' + aCount);
		aToggle.setAttribute('href', '#collapse' + groupCount);
		aToggle.innerText = header;


		var aBody = document.createElement('div');
		aBody.setAttribute('class', 'accordion-body collapse ');
		aBody.id = 'collapse' + groupCount;

		var aInner = document.createElement('div');
		aInner.setAttribute('class', 'accordion-inner');
		aInner.innerText = body;

		aBody.appendChild(aInner);
		aHeading.appendChild(aToggle);
		aGroup.appendChild(aHeading);
		aGroup.appendChild(aBody);

		groupCount++;

		return aGroup;
	};

	this.createAccordian = function(children, parent){
		var accordion = document.createElement('div');
		accordion.setAttribute('class', 'accordion');
		accordion.id = 'accordion' + aCount;

		aCount++;
		for(child in children){
			accordion.appendChild(children[child]);
		}
		parent.appendChild(accordion);
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
		word.onclick   = climb;
		sizeContainer.appendChild(word);
	}
});

socket.on('solution', function(answers) {
	var answersContainer = document.getElementById('size-solutions'),
	aGroups              = [];
	ladder.removeChildren(answersContainer);
	for(var i = 0; i < answers.length; i++){
		for(var j = 0; j < answers[i].length; j++){
			var innerString = '',
			line            = answers[i][j][0].split(' '),
			header          = line[0] + ' | ' + line[line.length - 1];
			for(var k = 0; k < answers[i][j].length; k++){
				innerString += answers[i][j][k] + '\n';
			}
			aGroups.push(aFactory.createAccordionGroup(header, innerString));
		}
	}	
	aFactory.createAccordian(aGroups, answersContainer);
	//still need to sort these for the right order
	loader.stop();
	
	$('#myModal').modal('hide');
});

socket.emit('sizelist');

//=============================================================================

function climb(e){
	socket.emit('climb2', parseInt(e.target.innerText));
	loader = ladder.getLoader(document.getElementById('modalmessage'));
	loader.start();
	$('#myModal').modal({
    	keyboard: false,
	   	backdrop: 'false'
	});
}

//Globals======================================================================
var aFactory = new accordionFactory(),
loader;

}