(function(){

	ladder = function(){

		var self = this;

		this.showAnswer = function(e){
			self.removeChildren(document.getElementById('modalmessage'));
			$('#myModal').modal({
		    	keyboard: false,
		    	backdrop: 'false'
			});
			var headerL = document.getElementById('modalheaderleft');
			headerL.innerText = 'From: ' + 
				e.target.answer[0] + '\t To: ' + e.target.answer[e.target.answer.length - 1];
			var headerR = document.getElementById('modalheaderright');
			headerR.innerText =  e.target.answer.length + ' rungs'
			startClimbingAnimation(e.target.answer);
		}

		this.removeChildren = function(domNode){
			while(domNode.hasChildNodes()){
				domNode.removeChild(domNode.lastChild);
			}
		}

		this.getRung = function(start, end){
			for(var i = 0; i < start.length; i++){
				if(start[i] !== end[i]){
					return {'index' : i, 'letter' : end[i]};
				}
			}
		}

		//Internals============================================================
		function startClimbingAnimation(answer){
			var START = answer[0];

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
					var rung = self.getRung(answer[rungCount], answer[rungCount + 1]);
					climbTransition(rung.index, rung.letter);
					rungCount++;
				}
				else{
					clearInterval(headTimer);
				}
			}, 2000);

		}
		return this;
	}

	ladder = new ladder();
	
})();