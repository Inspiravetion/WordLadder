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
			headerL.innerText = e.target.answer[0] + ' \t | \t ' + e.target.answer[e.target.answer.length - 1];
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

		this.getLoader = function(screen){
			return new Loader(screen);
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
					$('#myModal').modal('hide');
				}
			}, 2000);

		}

		Loader = function(loadScreen){
            var self   = this,
            message    = 'LOADING',
            timerFlag  = true;
            

            this.start = function(){
                loadScreen.innerText = message;
                loadOut();            

            };

            this.stop = function(){
                timerFlag = false;
            };

            function loadIn(){
                var count = 0,
                opa       = 0,
                timer     = setInterval(function(){
                    if(timerFlag && count != 50){
                        loadScreen.style.opacity = opa;
                        opa += .02;
                        count++;
                    }
                    else if(timerFlag){
                        loadScreen.style.opacity = 1;
                        clearInterval(timer);
                        loadOut();
                    }
                    else{
                        clearInterval(timer);
                    }               
                }, 10);
            }
    
            function loadOut(){
                
                var count = 0, 
                opa       = 1,
                timer     = setInterval(function(){
                    if(timerFlag && count != 50){
                        loadScreen.style.opacity = opa;
                        opa -= .02;
                        count++;
                    }
                    else if(timerFlag){
                        clearInterval(timer);
                        loadScreen.style.opacity = 0;
                        setTimeout(function(){
                            loadIn();
                        }, 500);
                    }
                    else{
                        clearInterval(timer);
                        //get rid of modal
                    }
                }, 10);   
            }
        
            return this;
		}

		return this;
	}

	ladder = new ladder();
	
})();