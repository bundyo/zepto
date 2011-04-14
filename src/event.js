(function($) {
    var $$ = $.qsa, handlers = {}, _zid = 1;

    function zid(element) {
        return element._zid || (element._zid = _zid++);
    }

    function findHandlers(element, event, fn, selector) {
        event = parse(event);
        if (event.ns) var matcher = matcherFor(event.ns);
        console.log((handlers[zid(element)] || []).filter(function(handler) {
            return handler
                    && (!event.e || handler.e == event.e)
                    && (!event.ns || matcher.test(handler.ns))
                    && (!fn || handler.fn == fn)
                    && (!fn.guid || handler.fn.guid == fn.guid)
                    && (!selector || handler.sel == selector);
        }));
        return (handlers[zid(element)] || []).filter(function(handler) {
            return handler
                    && (!event.e || handler.e == event.e)
                    && (!event.ns || matcher.test(handler.ns))
                    && (!fn || handler.fn == fn)
                    && (!fn.guid || handler.fn.guid == fn.guid)
                    && (!selector || handler.sel == selector);
        });
    }

    function parse(event) {
        var parts = ('' + event).split('.');
        return {e: parts[0], ns: parts.slice(1).sort().join(' ')};
    }

    function matcherFor(ns) {
        return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
    }

    $._guid = 1;

    function add(element, events, fn, selector, delegate) {
        var id = zid(element), set = (handlers[id] || (handlers[id] = []));
        events.split(/\s/).forEach(function(event) {
            if ( !fn.guid )
                fn.guid = $._guid++;

            if ( delegate && !delegate.guid )
                delegate.guid = $._guid++;

            var handler = $.extend(parse(event), {fn: fn, sel: selector, del: delegate, i: set.length});
            set.push(handler);
            element.addEventListener(handler.e, delegate || fn, false);
        });
    }

    function remove(element, events, fn, selector) {
        var id = zid(element);
        (events || '').split(/\s/).forEach(function(event) {
            findHandlers(element, event, fn, selector).forEach(function(handler) {
                delete handlers[id][handler.i];
                element.removeEventListener(handler.e, handler.del || handler.fn, false);
            });
        });
    }

    $.event = {
        add: function(element, events, fn) {
            add(element, events, fn);
        },
        remove: function(element, events, fn) {
            remove(element, events, fn);
        }
    };

    $.proxy = function(fn, proxy) {
        var output = null;
        if (fn) {
            output = function() {
                return fn.apply(proxy || this, arguments);
            };
            proxy.guid = fn.guid = fn.guid || proxy.guid || $._guid++;
        }
        return output;
    };

    $.fn.bind = function(event, callback) {
        return this.each(function() {
            add(this, event, callback);
        });
    };
    $.fn.unbind = function(event, callback) {
        return this.each(function() {
            remove(this, event, callback);
        });
    };
    $.fn.one = function(event, callback) {
        return this.each(function() {
            var self = this;
            add(this, event, function wrapper() {
                callback();
                remove(self, event, arguments.callee);
            });
        });
    };

    var eventMethods = ['preventDefault', 'stopImmediatePropagation', 'stopPropagation'];

    function createProxy(event) {
        var proxy = $.extend({originalEvent: event}, event);
        eventMethods.forEach(function(key) {
            proxy[key] = function() {
                return event[key].apply(event, arguments)
            };
        });
        return proxy;
    }

    $.fn.delegate = function(selector, event, callback) {
        return this.each(function(i, element) {
            add(element, event, callback, selector, function(e) {
                var target = e.target, nodes = $$(element, selector);
                while (target && nodes.indexOf(target) < 0) target = target.parentNode;
                if (target && !(target === element) && !(target === document)) {
                    callback.call(target, $.extend(createProxy(e), {
                        currentTarget: target, liveFired: element
                    }));
                }
            });
        });
    };
    $.fn.undelegate = function(selector, event, callback) {
        return this.each(function() {
            remove(this, event, callback, selector);
        });
    };

    $.fn.live = function(event, callback) {
        $(document.documentElement).delegate(this.selector, event, callback);
        return this;
    };
    $.fn.die = function(event, callback) {
        $(document.documentElement).undelegate(this.selector, event, callback);
        return this;
    };

    $.fn.trigger = function(event) {
        var oE = arguments[1] || null;

        return this.each(function() {
            var e = document.createEvent('Events');
            e.initEvent(event, true, true);
            e.originalEvent = oE;

            this.dispatchEvent(e);
        });
    };
})(Zepto);
