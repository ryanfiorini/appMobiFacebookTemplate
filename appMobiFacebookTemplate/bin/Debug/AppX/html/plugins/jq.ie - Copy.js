//Convert MS Specific events to touch events

if(window.navigator.msPointerEnabled){

	document.addEventListener("MSPointerUp",trigger,true);
	document.addEventListener("MSPointerDown",trigger,true);
	document.addEventListener("MSPointerMove",trigger,true);

	var moving=false;
	function trigger(evt){
		

		switch(evt.type){
			case "MSPointerMove":
			if(!moving) return;
				evt.preventDefault();
				redirectMSToTouch("touchmove",evt);
			break;
			case "MSPointerDown":
			//evt.preventDefault();
				redirectMSToTouch("touchstart",evt);
				moving=true;
			break;
			case "MSPointerUp":
				evt.preventDefault();
				redirectMSToTouch("touchend",evt);
				moving=false;
			break;

		}
		
	}

	var redirectMSToTouch = function(type, originalEvent) 
	{

	    //stop propagation, and remove default behavior for everything but INPUT, TEXTAREA & SELECT fields
	    // originalEvent.stopPropagation();
	    if (originalEvent.target.tagName.toUpperCase().indexOf("SELECT") == -1 && 
	    originalEvent.target.tagName.toUpperCase().indexOf("TEXTAREA") == -1 && 
	    originalEvent.target.tagName.toUpperCase().indexOf("INPUT") == -1)  //SELECT, TEXTAREA & INPUT
	    {

	        originalEvent.stopPropagation();
	    }


	    var touchevt = document.createEvent("Event");
	    touchevt.initEvent(type, true, true);
	    touchevt.touches = new Array();
	    touchevt.touches[0] = new Object();
	    touchevt.touches[0].pageX = originalEvent.pageX;
	    touchevt.touches[0].pageY = originalEvent.pageY;
	    touchevt.touches[0].target = originalEvent.srcElement;
	    touchevt.touches[0].srcElement = originalEvent.srcElement;
	    touchevt.changedTouches = touchevt.touches; //for jqtouch
	    touchevt.targetTouches = touchevt.touches; //for jqtouch
	    touchevt.srcElement=touchevt.target=originalEvent.srcElement

	    originalEvent.target.dispatchEvent(touchevt);
	    
	    return touchevt;
	}
	$(document).one("DOMContentLoaded",function(){
		if($.ui){
		$.ui.ready(function(){
			//$.ui.finishTransition();
			var old=$.ui.availableTransitions['none'];
			$.ui.availableTransitions=[];
			$.ui.availableTransitions['default']=$.ui.availableTransitions["none"]=old;
		});	
		}
	});
}