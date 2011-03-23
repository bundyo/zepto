var Zepto = (function(selector, context) {
  var slice = [].slice, key, css, $$, fragmentRE, container, document = window.document, undefined, browser = {},
      getComputedStyle = document.defaultView.getComputedStyle;

  var featureCheck = document.createElement('div');
  featureCheck.style.cssText = '-moz-transform-origin: 0px 0px; -webkit-transform-origin: 0px 0px; -o-transform-origin: 0px 0px; -ms-transform-origin: 0px 0px; position: absolute; top: -10000px;';
  document.documentElement.appendChild(featureCheck);
  var featStyle = getComputedStyle(featureCheck);
  browser.Firefox = featStyle.getPropertyValue('-moz-transform-origin') == '0px 0px';
  browser.WebKit = featStyle.getPropertyValue('-webkit-transform-origin') == '0px 0px';
  browser.Opera = featStyle.getPropertyValue('-o-transform-origin') == '0px 0px';
  browser.IE = featStyle.getPropertyValue('-ms-transform-origin') == '0px 0px';
  browser.name = browser.Firefox ? 'Firefox' : browser.WebKit ? 'WebKit' : browser.Opera ? 'Opera' : browser.IE ? 'IE' : 'non-supported';
  document.documentElement.removeChild(featureCheck);
  featureCheck = null;

  function classRE(name){ return new RegExp("(^|\\s)" + name + "(\\s|$)") }
  function compact(array){ return array.filter(function(item){ return item !== undefined && item !== null }) }
  function flatten(array){ return [].concat.apply([], array); }
  function camelize(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function uniq(array) {
    var r = [];
    for (var i = 0,n = array.length; i < n; i++)
      if (r.indexOf(array[i]) < 0) r.push(array[i]);
    return r;
  }

  fragmentRE = /^\s*<[^>]+>/;
  container = document.createElement("div");
  function fragment(html) {
    container.innerHTML = ('' + html).trim();
    var result = slice.call(container.childNodes);
    container.innerHTML = '';
    return result;
  }

  function $(selector, context) {
    return new $.fn.init(selector, context);
  }

  function filtered(nodes, selector) {
    return selector === undefined ? $(nodes) : $(nodes).filter(selector);
  }

  $.fn = $.prototype = {
    init: function (selector, context) {
      if (!selector) {
        return this;
      }

      this.selector = selector;
      this.context = context;
      this._proto_ = this.prototype;

      if (selector == document) return this.makeResults([document], this);
      else if (context !== undefined) return $(context).find(selector);
      else if (typeof selector === 'function') return $(document).ready(selector);
      else {
        var dom;
        if (selector instanceof Array) dom = compact(selector);
        else if (selector instanceof Element || selector === window) dom = [selector];
        else if (fragmentRE.test(selector)) dom = fragment(selector);
        else dom = $$(document, selector);
        return this.makeResults(dom, this);
      }
    },
    type: function(obj) {
      return obj == null ?
          String(obj) :
          {}[ Object.prototype.toString.call(obj) ] || "object";
    },
    makeResults: function(array, results) {
      var ret = results || [];

      if (array != null) {
        var type = this.type(array);

        if (array.length == null || type === "string" || type === "function" || type === "regexp")
          Array.prototype.push.call(ret, array);
        else
          ret = this.merge(ret, array);
      }

      return ret;
    },
    merge: function(first, second) {
      var i = first.length,
          j = 0;

      if (typeof second.length === "number") {
        for (var l = second.length; j < l; j++) {
          first[ i++ ] = second[ j ];
        }

      } else {
        while (second[j] !== undefined) {
          first[ i++ ] = second[ j++ ];
        }
      }

      first.length = i;

      return first;
    },
    selector: "",
    length: 0,
    timeline: {},
    browser: browser.name,
    forEach: [].forEach,
    map: [].map,
    reduce: [].reduce,
    push: [].push,
    indexOf: [].indexOf,
    concat: [].concat,
    ready: function(callback) {
      document.addEventListener('DOMContentLoaded', callback, false);
      return this;
    },
    get: function(idx){ return idx === undefined ? this : this[idx] },
    size: function(){ return this.length },
    keys : function (obj) {
      var acc = [];
      for (var propertyName in obj)
        acc.push(propertyName);
      return acc;
    },
    values: function (obj) {
      var acc = [];
      for (var propertyName in obj)
        acc.push(obj[propertyName]);
      return acc;
    },
    remove: function(){ return this.each(function(){ this.parentNode.removeChild(this) }) },
    each: function(callback) {
      this.forEach(function(el, idx) {
        callback.call(el, idx, el)
      });
      return this;
    },
    filter: function(selector) {
      return $([].filter.call(this, function(element) {
        return $$(element.parentNode, selector).indexOf(element) >= 0;
      }));
    },
    is: function(selector) {
      return this.length > 0 && $(this[0]).filter(selector).length > 0;
    },
    not: function(selector) {
      var nodes = [];
      if (typeof selector == 'function' && selector.call !== undefined)
        this.each(function(idx) {
          if (!selector.call(this, idx)) nodes.push(this);
        });
      else {
        var ignores = slice.call(
            typeof selector === "string" ?
                this.filter(selector) :
                selector instanceof NodeList ? selector : $(selector));
        slice.call(this).forEach(function(el) {
          if (ignores.indexOf(el) < 0) nodes.push(el);
        });
      }
      return $(nodes);
    },
    eq: function(idx) {
      return $(this[idx])
    },
    first: function() {
      return $(this[0])
    },
    last: function() {
      return $(this[this.length - 1])
    },
    find: function(selector) {
      var result;
      if (this.length == 1) result = $$(this[0], selector);
      else result = flatten(this.map(function(el) {
        return $$(el, selector)
      }));
      return $(result);
    },
    closest: function(selector, context) {
      var node = this[0], nodes = $$(context !== undefined ? context : document, selector);
      if (nodes.length === 0) node = null;
      while (node && node !== document && nodes.indexOf(node) < 0) node = node.parentNode;
      return $(node !== document && node);
    },
    parents: function(selector) {
      var ancestors = [], nodes = this;
      while (nodes.length > 0)
        nodes = compact(nodes.map(function(node) {
          if ((node = node.parentNode) && node !== document && ancestors.indexOf(node) < 0) {
            ancestors.push(node);
            return node;
          }
        }));
      return filtered(ancestors, selector);
    },
    parent: function(selector) {
      return filtered(uniq(compact(this.pluck('parentNode'))), selector);
    },
    children: function(selector) {
      return filtered(flatten(this.map(function(el) {
        return slice.call(el.children)
      })), selector);
    },
    siblings: function(selector) {
      return filtered(flatten(this.map(function(el) {
        return slice.call(el.parentNode.children).filter(function(child) {
          return child !== el
        });
      })), selector);
    },
    pluck: function(property) {
      return this.map(function(element) {
        return element[property]
      })
    },
    show: function() {
      return this.css('display', 'block')
    },
    hide: function() {
      return this.css('display', 'none')
    },
    prev: function() {
      return $(this.pluck('previousElementSibling'))
    },
    next: function() {
      return $(this.pluck('nextElementSibling'))
    },
    html: function(html) {
      return html === undefined ?
          (this.length > 0 ? this[0].innerHTML : null) :
          this.each(function(idx) {
            this.innerHTML = typeof html == 'function' ? html.call(this, idx, this.innerHTML) : html
          });
    },
    text: function(text) {
      return text === undefined ?
          (this.length > 0 ? this[0].innerText : null) :
          this.each(function() {
            this.innerText = text
          });
    },
    attr: function(name, value) {
      return (typeof name == 'string' && value === undefined) ?
          (this.length > 0 && this[0].nodeName === 'INPUT' && this[0].type === 'text' && name === 'value') ? (this.val()) :
              (this.length > 0 ? this[0].getAttribute(name) || (name in this[0] ? this[0][name] : undefined) : null) :
          this.each(function(idx) {
            if (typeof name == 'object') for (key in name) this.setAttribute(key, name[key])
            else this.setAttribute(name, typeof value == 'function' ? value.call(this, idx, this.getAttribute(name)) : value);
          });
    },
    removeAttr: function(name) {
      return this.each(function() {
        this.removeAttribute(name);
      });
    },
    data: function(name, value) {
      return this.attr('data-' + name, value);
    },
    val: function(value) {
      return (value === undefined) ?
          (this.length > 0 ? this[0].value : null) :
          this.each(function() {
            this.value = value;
          });
    },
    offset: function() {
      var obj = this[0].getBoundingClientRect();
      return {
        left: obj.left + document.body.scrollLeft,
        top: obj.top + document.body.scrollTop,
        width: obj.width,
        height: obj.height
      };
    },
    css: function(property, value) {
      if (value === undefined && typeof property == 'string')
        return this[0].style[camelize(property)] || getComputedStyle(this[0], '').getPropertyValue(property);
      css = "";
      for (key in property) css += key + ':' + property[key] + ';';
      if (typeof property == 'string') css = property + ":" + value;
      return this.each(function() {
        this.style.cssText += ';' + css
      });
    },
    index: function(element) {
      return this.indexOf($(element)[0]);
    },
    hasClass: function(name) {
      return classRE(name).test(this[0].className);
    },
    addClass: function(name) {
      return this.each(function() {
        !$(this).hasClass(name) && (this.className += (this.className ? ' ' : '') + name)
      });
    },
    removeClass: function(name) {
      return this.each(function() {
        this.className = this.className.replace(classRE(name), ' ').trim()
      });
    },
    toggleClass: function(name, when) {
      return this.each(function() {
        ((when !== undefined && !when) || $(this).hasClass(name)) ?
            $(this).removeClass(name) : $(this).addClass(name)
      });
    },
    getEventPrefix: function () {
      if (!this._eventPrefix) {
        this._eventPrefix = '';
        switch (browser.name) {
          case 'WebKit': this._eventPrefix = 'webkit'; break;
          case 'Opera': this._eventPrefix = 'o'; break;
        }
      }

      return this._eventPrefix;
    },
    getCssPrefix: function () {
      if (!this._cssPrefix) {
        this._cssPrefix = '';
        switch (browser.name) {
          case 'Firefox': this._cssPrefix = '-moz-'; break;
          case 'WebKit': this._cssPrefix = '-webkit-'; break;
          case 'Opera': this._cssPrefix = '-o-'; break;
          case 'IE': this._cssPrefix = '-ms-'; break;
        }
      }

      return this._cssPrefix;
    }
  };

  $.fn.init.prototype = $.fn;

  $.extend = $.fn.extend = function(target, source) {
    for (key in source) target[key] = source[key];
    return target
  };
  $.qsa = $$ = function(element, selector) {
    return slice.call(element.querySelectorAll(selector))
  };

  ['width', 'height'].forEach(function(property) {
    $.fn[property] = function() {
      return this.offset()[property]
    }
  });


  var adjacencyOperators = {append: 'beforeEnd', prepend: 'afterBegin', before: 'beforeBegin', after: 'afterEnd'};

  for (key in adjacencyOperators)
    $.fn[key] = (function(operator) {
      return function(html) {
        return this.each(function(index, element) {
          if (html instanceof $) {
            dom = html;
            if (operator == "afterBegin" || operator == "afterEnd")
              for (var i = 0; i < dom.length; i++) element['insertAdjacentElement'](operator, dom[dom.length - i - 1]);
            else
              for (var i = 0; i < dom.length; i++) element['insertAdjacentElement'](operator, dom[i]);
          } else {
            element['insertAdjacent' + (html instanceof Element ? 'Element' : 'HTML')](operator, html);
          }
        });
      };
    })(adjacencyOperators[key]);

  return $;
})();

'$' in window || (window.$ = Zepto);
