(function($) {
  $.fn.animate = function(properties, duration, ease, callback) {
    var transforms = [], transitions = {}, key, that = this,
        transformProps = ['perspective', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'rotate3d', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'scale3d', 'skew', 'skewX', 'skewY', 'translate', 'translateX', 'translateY', 'translateZ', 'translate3d', 'matrix', 'matrix3d'];
    for (key in properties)
      if (transformProps.indexOf(key) != -1)
        transforms.push(key + '(' + properties[key] + ')');
      else
        transitions[key] = properties[key];

    typeof callback == 'function' && this.one($.getEventPrefix() + 'TransitionEnd', callback);

    this.css(this.getCssPrefix() + 'transition', 'all ' + (duration !== undefined ? duration : 0.5) + 's ' + (ease || ''));

    transitions[this.getCssPrefix() + 'transform'] = transforms.join(' ');

    this.animProperties = this.keys(transitions);

    setTimeout(function () {
      that.css(transitions);
    }, 0); // Opera Mobile is one dumb animal

    this.queue();

    return this;
  };

  $.fn.queue = function() {
    this.transitions[this.selector] = this;
  };

  $.fn.dequeue = function() {
    delete this.transitions[this.selector];
  };

  $.fn.stop = function(stopAll, gotoEnd) {
    var that = this;

    var stopTransition = function (selection, gotoEnd) {
      if (!gotoEnd) {
        var animProperties = selection.animProperties;
        if (!animProperties) return;

        var style = document.defaultView.getComputedStyle(selection[0], null),
            cssValues = {},
            prop;

        for (prop in animProperties)
          cssValues[animProperties[prop]] = style.getPropertyValue(animProperties[prop]);

        selection.css(selection.getCssPrefix() + 'transition', 'none');

        selection.css( cssValues);

      } else
        selection.css(that.getCssPrefix() + 'transition-property', 'none');

      selection.dequeue(selection);
    };

    if (stopAll) {
      for (var idx in this.transitions) {
        stopTransition(that.transitions[idx], gotoEnd);
      }
    } else
      stopTransition(this.transitions[this.selector], gotoEnd);

    return this;
  };

})(Zepto);
