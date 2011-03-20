(function($) {
  $.fn.animate = function(properties, duration, ease, callback) {
    var transforms = [], cssValues = {}, key, animationStep = {},
        transformProps = ['perspective', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'rotate3d', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'scale3d', 'skew', 'skewX', 'skewY', 'translate', 'translateX', 'translateY', 'translateZ', 'translate3d', 'matrix', 'matrix3d'];
    for (key in properties)
      if (transformProps.indexOf(key) != -1)
        transforms.push(key + '(' + properties[key] + ')');
      else
        cssValues[key] = properties[key];

    animationStep.type = 'transition';
    animationStep.callback = callback;
    animationStep.setup = {};
    animationStep.setup[this.getCssPrefix() + 'transition'] = 'all ' + (duration !== undefined ? duration : 0.5) + 's ' + (ease || '');
    
    cssValues[this.getCssPrefix() + 'transform'] = transforms.join(' ');

    animationStep.keys = this.keys( cssValues );
    animationStep.CSS = cssValues;
    animationStep.object = this;

    if (this.queue(animationStep) == 1)
      this.activateTask();

    return this;
  };

  $.fn.activateTask = function() {

    if (this.selector in this.timeline && this.timeline[this.selector].length) {
      var currentTransition = this.timeline[this.selector][0];

      if (currentTransition.type == 'delay') {
        var that = this;
        
        setTimeout( function () {
          that.advanceQueue();
        }, currentTransition.duration );

        return;
      }

      var eventName = this.getEventPrefix() + 'TransitionEnd';
      if (!this.getEventPrefix())
        eventName = eventName.toLowerCase();

      typeof currentTransition.callback == 'function' && currentTransition.object.one( eventName, this.proxy( currentTransition.callback, this ) );
      currentTransition.object.one( eventName, this.proxy( this.advanceQueue, this ) );

      currentTransition.object.css( currentTransition.setup );

      setTimeout(function () {
        currentTransition.object.css( currentTransition.CSS );
      }, 0); // Opera Mobile is one dumb animal
    }

  };

  $.fn.advanceQueue = function() {
    this.dequeue();

    this.activateTask();
  };

  $.fn.queue = function( step ) {
    if (!(this.selector in this.timeline))
      this.timeline[this.selector] = [];
    
    this.timeline[this.selector].push(step);

    return this.timeline[this.selector].length;
  };

  $.fn.dequeue = function() {
    this.timeline[this.selector].shift();

    if (this.timeline[this.selector] == [])
      delete this.timeline[this.selector]
  };

  $.fn.delay = function( timeSpan ) {
    var animationStep = {};

    animationStep.type = 'delay';
    animationStep.duration = timeSpan;

    if (this.queue(animationStep) == 1)
      this.activateTask();

    return this;
  };

  $.fn.stop = function( stopAll, gotoEnd ) {
    var that = this;

    var stopTransition = function (selection, gotoEnd) {
      if (!selection || !('object' in selection)) return;

      var aObject = selection.object;

      if (!gotoEnd) {

        var animProperties = selection.keys;
        if (!animProperties) return;

        var style = document.defaultView.getComputedStyle(aObject[0], null),
            cssValues = {},
            prop;

        for (prop in animProperties)
          cssValues[animProperties[prop]] = style.getPropertyValue(animProperties[prop]);

        aObject.css( that.getCssPrefix() + 'transition', 'none' );

        aObject.css( cssValues );

      } else
        aObject.css( that.getCssPrefix() + 'transition', 'none' );

      aObject.dequeue();
    };

    if (stopAll) {
      for (var idx in this.timeline) {
        stopTransition(that.timeline[idx][0], gotoEnd);
      }
    } else
      stopTransition(this.timeline[this.selector][0], gotoEnd);

    return this;
  };

})(Zepto);
