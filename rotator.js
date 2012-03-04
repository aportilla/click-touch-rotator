
/**
 * @author : Adam Portilla
 *  
 * @permissions : Free to use and abuse however you like.
 *
 * @author-website :  http://adamportilla.net/dev
 */

/**
 * Rotator
 * The rotator namespace exposes a simple
 * 'create' public interface that instatiates
 * an image rotator object based on an array
 * of image urls.  A user can use mouse or
 * touch interactions with an image to pan
 * left-right, causing the rotator to swap 
 * out the image src, creating an illusion
 * of 360 degree rotation (depending on the images)
 *
 * public interface:
 * - create(
 *     circumference : int
 *     container : domElement
 *     imageUrls : array of strings
 *   )
 */
var rotator = function(RT) {
    
    /*
     * Object Namespace
     */
    RT = RT || {};
    
    /*
     * Drag
     */
    RT.addDragEvents = function(node, my){

        node = aFrame.event(node);
        
        my = {
            posX : 0,
            posY : 0,
            deltaX : 0,
            deltaY : 0,
            startDrag : function(e){
                var pos = aFrame.getEventPosition(e);
                my.posX = pos.x;
                my.posY = pos.y;
                my.drag(e);
                aFrame.addListener('touchmove', document.body, my.drag);
                aFrame.addListener('touchend', document.body, my.endDrag);
                aFrame.addListener('mousemove', document.body, my.drag);  
                aFrame.addListener('mouseup', document.body, my.endDrag);
                node.fire('dragstart', e);
            },
            drag : function(e){
                aFrame.stopEvent(e);
                var pos = aFrame.getEventPosition(e);
                my.deltaX = pos.x - my.posX;
                my.deltaY = pos.y - my.posY;
                my.posX = pos.x;
                my.posY = pos.y;
                node.fire('drag',{
                    x : my.deltaX,
                    y : my.deltaY
                });
            },
            endDrag : function(e){
                aFrame.removeListener('mousemove', document.body, my.drag); 
                aFrame.removeListener('mouseup', document.body, my.endDrag);
                aFrame.removeListener('touchmove', document.body, my.drag); 
                aFrame.removeListener('touchend', document.body, my.endDrag);
                node.fire('dragend',e);
            }
        };
        
        aFrame.addListener('touchstart', node, my.startDrag);
        aFrame.addListener('mousedown', node, my.startDrag);
        
        return node;
        
    };
        
    /*
     * Image
     * caches the supplied
     * src image upon instantiation.
     */
    RT.image = function(p,my){

        var that = {};
        my = my || {};
        p = p || {};
        
        my.url = p.url || '';
        my.image = new Image();
        my.ready = false;
        
        that.getUrl = function(){
            return my.url;
        };
        
        that.isReady = function(){
            return my.ready;
        };
        
        my.init = function(){
            my.image.onload = function(){
                my.ready = true;
            };
            my.image.src = my.url;
        };
        
        my.init();
        
        return that;   
    };
    
    /*
     * Coordinator
     * @uses : addDragEvents
     * @uses : image
     */
    RT.coordinator = function(p,my){
        
        /*
         * Object Namespaces
         */
        var that = {};
        my = my || {};
        p = p || {};
       
        /*
         * Protected Members
         */
        my.container = p.container || document.body;
        my.imageUrls = p.imageUrls || [''];
        my.circumference = p.circumference || 200;
        
        my.image = RT.addDragEvents(new Image());
        
        my.images = [];
        my.curAmount = 0;
        my.curIndex = 0;
        
        /*
         * update
         * updates the value of curAmount based
         * on the delta change in position
         * and the set rotation circumference
         * and updates the current index value
         * to indicate which item within the images
         * array is the 'current' one.
         *
         * curAmount is always a value between 0 and 1
         */
        my.update = function(deltaX,deltaY){

            my.curAmount += (deltaX % my.circumference) / my.circumference;
            
            if (my.curAmount < 0){
                my.curAmount += 1;
            }
            
            if (my.curAmount > 1){
                my.curAmount -= 1;
            }
            
            var index = Math.floor(my.images.length * my.curAmount);
            
            if (index !== my.curIndex 
                && index < my.images.length 
                && my.images[index].isReady()){
                
                my.image.src = my.images[index].getUrl();
                my.curIndex = index;
            }
            
        };
        
        /*
         * Init
         * set the initial image src and place the image 
         * into the container.
         * stuff the images array with image objects that
         * cache all the rotator images.
         */
        my.init = function(){

            my.image.src = my.imageUrls[my.curIndex];

            my.container.appendChild(my.image);

            for (var i = 0; i < my.imageUrls.length; i++){   
                my.images.push(RT.image({url : my.imageUrls[i]}));
            }
        };
        
        /*
         * Init Listeners
         * fire the update function with the delta change
         * in xy positions and add and remove an 'active' class
         * name to the displayed img element during dragging.
         */
        my.initListeners = function(){
            
            my.image.on('drag',function(delta){
                my.update(delta.x, delta.y);
            });
        
            my.image.on('dragstart',function(){
                my.image.className = 'active';
            });
        
            my.image.on('dragend',function(){
                my.image.className = '';
            });
            
        };
        
        /*
         * Initialize
         * process the imageUrls, and add listeners for drag events
         */
        my.init();
        my.initListeners();
        
        /*
         * Return Public Interface of Coordinator
         */
        return that;
    };
    
    /*
     * Return Public Interface of Namespace
     */
    return {
        create : function(p){
            return RT.coordinator(p);
        }
    };
}();
