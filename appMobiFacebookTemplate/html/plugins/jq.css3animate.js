(function ($) {
    var cache = [];
    var objId=function(obj){
        if(!obj.jqmCSS3AnimateId) obj.jqmCSS3AnimateId=$.uuid();
        return obj.jqmCSS3AnimateId;
    }
    var getEl=function(elID){
        if (typeof elID == "string" || elID instanceof String) {
            return document.getElementById(elID);
        } else if($.is$(elID)){
            return elID[0];
        } else {
            return elID;
        }
    }
    var getCSS3Animate=function(obj, options){
        var tmp, id, el = getEl(obj);
        //first one
        id = objId(el);
        if(cache[id]){
            cache[id].animate(options);
            tmp = cache[id];
        } else {
            tmp = css3Animate(el, options);
            cache[id] = tmp;
        }
        return tmp;
    }
    $.fn["css3Animate"] = function (opts) {
        //keep old callback system - backwards compatibility - should be deprecated in future versions
        if(!opts.complete && opts.callback) opts.complete = opts.callback;
        //first on
        var tmp = getCSS3Animate(this[0], opts);
        opts.complete=null;
        opts.sucess=null;
        opts.failure=null;
        for (var i = 1; i < this.length; i++) {
            tmp.link(this[i], opts);
        }
        return tmp;
    };
    

    $["css3AnimateQueue"] = function () {
        return new css3Animate.queue();
    }

    //if (!window.WebKitCSSMatrix) return;
    var translateOpen = "(";
    var translateClose = ")";
    var transitionEnd=$.os.ie?"transitionend":$.cssPrefix.replace(/-/g,"")+"TransitionEnd";
    var css3Animate = (function () {
        
        var css3Animate = function (elID, options) {
            if(!(this instanceof css3Animate)) return new css3Animate(elID, options);
            
            //start doing stuff
            this.callbacksStack = [];
            this.activeEvent = null;
            this.countStack = 0;
            this.isActive = false;
            this.el = elID;
            this.linkFinishedProxy_ = $.proxy(this.linkFinished, this);
            
            if (!this.el) return;
            
            this.animate(options);
            
            var that = this;
            jq(this.el).bind('destroy', function(){
                var id = that.el.jqmCSS3AnimateId;
                that.callbacksStack = [];
                if(cache[id]) delete cache[id];
            });
        };
        css3Animate.prototype = {
            animate:function(options){
                
                //cancel current active animation on this object
                if(this.isActive) this.cancel();
                this.isActive = true;
                
                if (!options) {
                    alert("Please provide configuration options for animation of " + this.el.id);
                    return;
                }
            
                var classMode = !!options["addClass"];
            
                if(classMode){
                    //class defines properties being changed
                    if(options["removeClass"]){
                        jq(this.el).replaceClass(options["removeClass"], options["addClass"]);
                    } else {
                        jq(this.el).addClass(options["addClass"]);
                    }
                
                } else {
                    //property by property
                    var timeNum = numOnly(options["time"]);
                    if(timeNum==0) options["time"]=0;
                
                    if (!options["y"]) options["y"] = 0;
                    if (!options["x"]) options["x"] = 0;
                    if (options["previous"]) {
                        var cssMatrix = new $.getCssMatrix(this.el);
                        options.y += numOnly(cssMatrix.f);
                        options.x += numOnly(cssMatrix.e);
                    }
                    if (!options["origin"]) options.origin = "0% 0%";

                    if (!options["scale"]) options.scale = "1";

                    if (!options["rotateY"]) options.rotateY = "0";
                    if (!options["rotateX"]) options.rotateX = "0";
                    if (!options["skewY"]) options.skewY = "0";
                    if (!options["skewX"]) options.skewX = "0";


                    if (!options["timingFunction"]) options["timingFunction"] = "linear";

                    //check for percent or numbers
                    if (typeof (options.x) == "number" || (options.x.indexOf("%") == -1 && options.x.toLowerCase().indexOf("px") == -1 && options.x.toLowerCase().indexOf("deg") == -1)) options.x = parseInt(options.x) + "px";
                    if (typeof (options.y) == "number" || (options.y.indexOf("%") == -1 && options.y.toLowerCase().indexOf("px") == -1 && options.y.toLowerCase().indexOf("deg") == -1)) options.y = parseInt(options.y) + "px";
                    
                    var trans= "translate" + translateOpen + (options.x) + "," + (options.y) + translateClose + " scale(" + parseFloat(options.scale) + ") rotate(" + options.rotateX + ") rotateY(" + options.rotateY + ") skew(" + options.skewX + "," + options.skewY + ")";
                    this.el.style[$.cssPrefix+"transform"]=trans;
                    this.el.style[$.cssPrefix+"backface-visibility"] = "hidden";
                    var properties = $.cssPrefix+"transform";
                    if (options["opacity"]!==undefined) {
                        this.el.style.opacity = options["opacity"];
                        properties+=", opacity";
                    }
                    if (options["width"]) {
                        this.el.style.width = options["width"];
                        properties = "all";
                    }
                    if (options["height"]) {
                        this.el.style.height = options["height"];
                        properties = "all";
                    }
                    this.el.style[$.cssPrefix+"transition-property"] = properties;
                
                    if((""+options["time"]).indexOf("s")===-1) {
                        var scale = 'ms';
                        var time = options["time"]+scale;
                    } else if(options["time"].indexOf("ms")!==-1){
                        var scale = 'ms';
                        var time = options["time"];
                    } else {
                        var scale = 's';
                        var time = options["time"]+scale;
                    }
            
                    this.el.style[$.cssPrefix+"transition-duration"] = time;
                    this.el.style[$.cssPrefix+"transition-timing-function"] = options["timingFunction"];
                    this.el.style[$.cssPrefix+"transform-origin"] = options.origin;

                }

                //add callback to the stack
                
                this.callbacksStack.push({
                    complete : options["complete"],
                    success : options["success"],
                    failure : options["failure"]
                });
                this.countStack++;
            
                var that = this;
                var style = window.getComputedStyle(this.el);
                if(classMode){
                    //get the duration
                    var duration = style[$.cssPrefix+"transition-duration"];
                    var timeNum = numOnly(duration);
                    if(duration.indexOf("ms")!==-1){
                        var scale = 'ms';
                    } else {
                        var scale = 's';
                    }
                }
                
                //finish asap
                if(timeNum==0 || (scale=='ms' && timeNum<5) || style.display=='none'){
                    //the duration is nearly 0 or the element is not displayed, finish immediatly
                    $.asap($.proxy(this.finishAnimation, this, [false]));
                    //set transitionend event
                } else {
                    //setup the event normally
                    this.activeEvent = function(event){
                        that.finishAnimation(event);
                        that.el.removeEventListener(transitionEnd, that.activeEvent, false);
                    };                  
                    this.el.addEventListener(transitionEnd, this.activeEvent, false);
                }
                
            },
            addCallbackHook:function(callback){
                if(callback) this.callbacksStack.push(callback);
                this.countStack++;
                return this.linkFinishedProxy_;
            },
            linkFinished:function(canceled){
                if(canceled) this.cancel();
                else this.finishAnimation();
            },
            finishAnimation: function (event) {
                if(event) event.preventDefault();
                if(!this.isActive) return;
                
                this.countStack--;
                
                if(this.countStack==0) this.fireCallbacks(false);
            },
            fireCallbacks:function(canceled){
                this.clearEvents();
                
                //keep callbacks after cleanup
                // (if any of the callbacks overrides this object, callbacks will keep on fire as expected)
                var callbacks = this.callbacksStack;
                
                //cleanup
                this.cleanup();
                
                //fire all callbacks
                for(var i=0; i<callbacks.length; i++) {
                    var complete = callbacks[i]['complete'];
                    var success = callbacks[i]['success'];
                    var failure = callbacks[i]['failure'];
                    //fire callbacks
                    if(complete && typeof (complete) == "function") complete(canceled);
                    //success/failure
                    if(canceled && failure && typeof (failure) == "function") failure();
                    else if(success && typeof (success) == "function") success();
                }
            },
            cancel:function(){
                if(!this.isActive) return;
                this.fireCallbacks(true); //fire failure callbacks
            },
            cleanup:function(){
                this.callbacksStack=[];
                this.isActive = false;
                this.countStack = 0;
            },
            clearEvents:function(){
                if(this.activeEvent) {
                    this.el.removeEventListener(transitionEnd, this.activeEvent, false);
                }
                this.activeEvent = null;
            },
            link: function (elID, opts) {
                var callbacks = {complete:opts.complete,success:opts.success,failure:opts.failure};
                opts.complete = this.addCallbackHook(callbacks);
                opts.success = null;
                opts.failure = null;
                //run the animation with the replaced callbacks
                getCSS3Animate(elID, opts);
                //set the old callback back in the obj to avoid strange stuff
                opts.complete = callbacks.complete;
                opts.success = callbacks.success;
                opts.failure = callbacks.failure;
                return this;
            }
        }
        
        // var tmp = new $.css3AnimateQueue();
        // tmp.push({id:"animate",x:20,y:30,time:"300ms"});
        // tmp.push({id:"animate",x:20,y:30,time:"500ms",previous:true});
        // tmp.push({id:"animate",x:0,y:0,time:"0ms"});
        // tmp.push({id:"animate",x:20,y:30,time:"300ms"});
        // tmp.push({id:"animate",x:20,y:30,time:"500ms",previous:true});
        // tmp.push(function(){reset()});
        // tmp.run();
        
        //uncomment for performance debug
        //css3Animate = $.debug.type(css3Animate, 'css3Animate');
        
        
        return css3Animate;
    })();

    css3Animate.queue = function () {
        return {
            elements: [],
            push: function (el) {
                this.elements.push(el);
            },
            pop: function () {
                return this.elements.pop();
            },
            run: function () {
                var that = this;
                if (this.elements.length == 0) return;
                if (typeof (this.elements[0]) == "function") {
                    var func = this.shift();
                    func();
                }
                if (this.elements.length == 0) return;
                var params = this.shift();
                if (this.elements.length > 0) params.complete = function (canceled) {
                    if(!canceled) that.run();
                };
                css3Animate(document.getElementById(params.id), params);
            },
            shift: function () {
                return this.elements.shift();
            }
        }
    };
})(jq);
