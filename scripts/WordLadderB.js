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

var last, expectLength;

socket.on('solution', function(answers) {
	var aGroups = [];
	if(answers != last && answers.split(' ')[0]){
		//console.log(answers);
		aGroups.push(aFactory.createAccordionGroup(answers.split(' ')[0].length, answers));
		console.log('created group ' + (aGroups.length) + '.' );
		console.log(aGroups);
		last = answers;
			aFactory.createAccordian(aGroups, document.getElementById('size-solutions'));
			loader.stop();
			$('#myModal').modal('hide');
	}
	
});

socket.on('expect', function(length){
	expectLength = length;
});

socket.emit('sizelist');

//=============================================================================

// socket.on('connection', function(){
	socket.emit('climb3');
	loader = ladder.getLoader(document.getElementById('modalmessage'));
	loader.start();
	$('#myModal').modal({
    	keyboard: false,
	   	backdrop: 'false'
	});
// });

//Globals======================================================================
var aFactory = new accordionFactory(),
loader;

}