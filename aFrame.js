
/**
 * @author : Adam Portilla
 *  
 * @permissions : Do as you will and please drop me a line
 *                so I can bask in your glory :)
 *
 * @author-website :  http://adamportilla.net/dev
 */

/**
 * A Frame microframework
 *
 */
var aFrame = function(AF) {
    
    /*
     * Object Namespace
     */
    AF = AF || {};

    AF.browser = function(){
        
        var ua = navigator.userAgent;

        var browsers = [
            {subString : 'iPod', code : 'mobile'},
            {subString : 'iPhone', code : 'mobile'},
            {subString : 'iPad', code : 'mobile'},
            {subString : 'Apple', code : 'webkit'},
            {subString : 'Chrome', code : 'webkit'},
            {subString : 'Gecko', code : 'mozilla'}
        ];
        
        bCount = browsers.length;

        for (var i=0; i<bCount; i++){
            var item = browsers[i];
            var hasItem  = ua.indexOf(item.subString);
            
            if (hasItem !== -1){
                return item.code;
			}
			
        }
        
        return 'default';
        
    }();
    
    

    /**
     *  Add Listener
     */
    AF.addListener = function(evt,obj,handler){
        if ( document.addEventListener ) {
            obj.addEventListener(evt, handler, false); 
        } else { 
            // IE 
            obj.attachEvent('on' + evt, handler); 
        }
    };
    
    /*
     * Remove Listener
     */
    AF.removeListener = function(evt,obj,handler){
        if ( document.addEventListener ) {
            obj.removeEventListener(evt, handler, false); 
        } else { 
            // IE 
            obj.detachEvent('on' + evt, handler); 
        }
    };
    
    /*
     * Get Regular Expression
     */
    AF.getRegExp = function(){
        var cache = {};
        return function(str,flags){
            if (!cache[str + flags]) {
                cache[str + flags] = new RegExp(str, flags);
            }
            return cache[str + flags];
        }; 
    }();
    
    /*
     * Has Class
     */
    AF.hasClass = function(node,className){
        return AF.getRegExp('(?:^|\\s+)' + className + '(?:\\s+|$)')
                 .test(node.className);
    };
    
    /*
     * Add Class
     */
    AF.addClass = function(node,className){
        if (!AF.hasClass(node, className)) {
            node.className = node.className + ' ' + className;
        }
    };
    
    /*
     * Remove Class
     */
    AF.removeClass = function(node,className){
        if (AF.hasClass(node, className)) {
            node.className = node.className.replace(
                AF.getRegExp('(?:^|\\s+)' + className + '(?:\\s+|$)'), 
                ' '
            );
        }       
    };
    
    /*
     * Get Event Target
     * - what dom element was clicked on to fire
     *   this event?
     * - this handles both IE and Safari quirks.
     */
    AF.getEventTarget = function(e){
        var t;
        e = e || window.event;
        if (e.target) t = e.target;
        else if (e.srcElement) t = e.srcElement;
        if (t.nodeType == 3)
        t = t.parentNode;
        
        return t;
    };
    
    /*
     * Get Event Position
     * - return the xy coordinates within the document
     *   for an event with xy data
     */
    AF.getEventPosition = function(e){
    
        var posx = 0,
            posy = 0;
    
        e = e || window.event;
        
        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        } else if (e.clientX || e.clientY)    {
            posx = e.clientX + document.body.scrollLeft
                + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop
                + document.documentElement.scrollTop;
        } else if (e.targetTouches) {
            posx = e.targetTouches[0].pageX;
            posy = e.targetTouches[0].pageY;
        }
        
        return {
            x : posx,
            y : posy
        }
    };

    /*
     * Get Element Position
     */
    AF.getElementPosition = function(el){
    	
    	var curleft = 0;
    	var curtop = 0;
    	
    	if (el.offsetParent){
            do {
    	       curleft += el.offsetLeft;
    	       curtop += el.offsetTop;
            } while (el = el.offsetParent);
    	}
        
        return {
            x : curleft,
            y : curtop
        };
        
    };
    
    /*
     * On Click
     * - a wrapper for the addListener function that
     *   checks the click event target to make sure
     *   that the event fires only if the user
     *   clicked directly on the specified dom element
     *   and not on some child element of that dom element.
     */
    AF.onClick = function(obj,handler){
        AF.addListener('click',obj,function(e){
            if (AF.getEventTarget(e) == obj) handler(e);
        });
    };

    /*
     *  Stop Event
     */
    AF.stopEvent = function(e){
        e = e || window.event;
        (e.preventDefault) ?  e.preventDefault() : e.returnValue = false;
    	(e.stopPropagation) ? e.stopPropagation() : e.cancelBubble = true;          
    };

    /*
     * Event
     */
    AF.event = function(obj,my){
    
        /*
         * Public and private object namespaces
         * The public namespace extends an optional
         * object literal passed in to the function.
         */
        var that = obj || {};
        my = my || {};
        
        /*
         * Registry
         */
        my.registry = [];
        
        /*
         * Clear
         * removes all functions registered
         * to a specific event name
         *
         * @param   string      name
         */
        that.clearEvents = function(name){
        
            /*
             * type-safing the name param
             */
            name = (typeof(name) == 'string') ? name : false;
            
            if (!name){
                my.registry = [];
                return;
            }
            
            if (my.registry.hasOwnProperty(name)){
                my.registry[name] = [];
            } 
        };

        /*
         * On
         * adds a function with args to be fired
         * when the specified named event is fired
         *
         * @param   string      name
         * @param   function    fn
         * @param   --          args
         */
        that.on = function(name,fn,args){
        
            /*
             * type-safing the name and fn params
             */
            name = (typeof(name) == 'string') ? name : 'unknown';
            fn = (typeof(fn) == 'function') ? fn : function(){};
            args = args || {};
            
            var registryItem = {func:fn,arguments:args};
            
            if (my.registry.hasOwnProperty(name)){
                my.registry[name].push(registryItem);
            } else {
                my.registry[name] = [registryItem];
            }
        };
        
        /*
         * Fire
         * executes all functions registered to
         * the named event, using an optional
         * payload object along with the registryItems
         * arguments as parameters
         * 
         * @param   string      name
         * @param   --          payload
         */
        that.fire = function(name,payload){
            
            var i,fns;
            
            payload = payload || {};
            
            if (typeof(name) !== 'string'){
                return false;
            }
            
            if (my.registry.hasOwnProperty(name)){
                fns = my.registry[name];
                for(i = 0; i < fns.length; i++){
                    fns[i].func(payload,fns[i].arguments);
                }
            }
        };
        
        /*
         * Return Interface
         */
        return that;
    };
    
    /*
     * Drag
     */
    AF.drag = function(node,my){

        my = {
            enabled : true,
            dragOffsetX : 0,
            dragOffsetY : 0,
            startDrag : function(e){
                if (!my.enabled){ return; }
                var pos = AF.getEventPosition(e);
                my.dragOffsetX = pos.x - node.offsetLeft;
                my.dragOffsetY = pos.y - node.offsetTop;
                my.drag(e);
                AF.addListener('mousemove', document.body, my.drag);  
                AF.addListener('mouseup', document.body, my.endDrag);
            },
            drag : function(e){
                AF.stopEvent(e);
                var pos = AF.getEventPosition(e);
                node.style.left = (pos.x - my.dragOffsetX) + 'px';
                node.style.top = (pos.y - my.dragOffsetY) + 'px';
            },
            endDrag : function(e){
                AF.removeListener('mousemove', document.body, my.drag); 
                AF.removeListener('mouseup', document.body, my.endDrag);
            }
        };
        
        AF.addListener('mousedown', node, my.startDrag);
        
        return {
            setEnabled : function(bool){
                if (bool){
                    my.enabled = true;
                    AF.addClass(node,'draggable');
                } else {
                    my.enabled = false;
                    AF.removeClass(node,'draggable');
                }
            }
        };
    };
    
    
    /*
     * Animation
     */
    AF.animation = function(node,my){
    
        my = {
            style : node.style,
            duration : .5,
            top : 0,
            left : 0,
            webkitStrategy : function(){
                my.style.WebkitTransform = 'translate3d('+my.left+'px, '+my.top+'px, 0)';
            },
            mozillaStrategy : function(){
                my.style.MozTransform = 'translate('+my.left+'px, '+my.top+'px)'; 
            },
            defaultStrategy : function(){
                my.style.left = my.left + 'px';
                my.style.top = my.top + 'px';
            }
        };
        
        my.run = function(){

            switch(AF.browser)
            {
            case 'webkit':
                return my.webkitStrategy;
                break;
            case 'mozilla':
                return my.mozillaStrategy;
                break;
            case 'mobile':
                return my.webkitStrategy;
                break;
            default:
                return my.defaultStrategy;
            }
            
        }();
        
        return {
            setDuration : function(d){},
            setLeft : function(x){ my.left = x; },
            setTop : function(y){ my.top = y; },
            run : my.run
        };
    };
    
    /*
     * Return Public Interface of Namespace
     */
    return AF;
    
}();
