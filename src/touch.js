(function($){
  var touch = {}, touchTimeout;

  function parentIfText(node){
    return 'tagName' in node ? node : node.parentNode;
  }

  $(document).ready(function(){
    if ($.fn.browser == 'Firefox') {

      ['touchstart', 'touchmove', 'touchend'].forEach(function(m){
        $.fn[m] = function(callback){ return this.bind(m, callback) }
      });

      $(document.body).bind('mousedown', function(e){
        $(e.target).trigger('touchstart');
      }).bind('mousemove', function(e){
        $(e.target).trigger('touchmove');
      }).bind('mouseup', function(e){
        $(e.target).trigger('touchend');
      });
    }
    
    $(document.body).bind('touchstart', function(e){
      var now = Date.now(), delta = now - (touch.last || now);
      touch.target = e.touches ? parentIfText(e.touches[0].target) : parentIfText(e.target);
      touchTimeout && clearTimeout(touchTimeout);
      touch.x1 = e.touches ? e.touches[0].pageX : e.pageX;
      if (delta > 0 && delta <= 250) touch.isDoubleTap = true;
      touch.last = now;
    }).bind('touchmove', function(e){
      touch.x2 = e.touches ? e.touches[0].pageX : e.pageX;
    }).bind('touchend', function(e){
      if (touch.isDoubleTap) {
        $(touch.target).trigger('doubleTap');
        touch = {};
      } else if (touch.x2 > 0) {
        Math.abs(touch.x1 - touch.x2) > 30 && $(touch.target).trigger('swipe') &&
          $(touch.target).trigger('swipe' + (touch.x1 - touch.x2 > 0 ? 'Left' : 'Right'));
        touch.x1 = touch.x2 = touch.last = 0;
      } else if ('last' in touch) {
        touchTimeout = setTimeout(function(){
          touchTimeout = null;
          $(touch.target).trigger('tap');
          touch = {};
        }, 250);
      }
    }).bind('touchcancel', function(){ touch = {} });
  });

  ['swipe', 'swipeLeft', 'swipeRight', 'doubleTap', 'tap'].forEach(function(m){
    $.fn[m] = function(callback){ return this.bind(m, callback) }
  });

})(Zepto);
