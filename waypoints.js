// Generated by CoffeeScript 1.3.3
(function() {
  var $, $w, Context, Waypoint, allWaypoints, contextCounter, contextKey, contexts, getWaypointsByElement, jQMethods, methods, resizeEvent, scrollEvent, waypointCounter, waypointEvent, waypointKey, wp, wps,
    __slice = [].slice;

  $ = window.jQuery;

  $w = $(window);

  allWaypoints = {};

  contextCounter = 1;

  contexts = {};

  contextKey = 'waypoints-context-id';

  resizeEvent = 'resize.waypoints';

  scrollEvent = 'scroll.waypoints';

  waypointCounter = 1;

  waypointEvent = 'waypoint.reached';

  waypointKey = 'waypoints-waypoint-ids';

  wp = 'waypoint';

  wps = 'waypoints';

  window.contexts = contexts;

  getWaypointsByElement = function(element) {
    var ids;
    ids = $(element).data(waypointKey);
    return $.map(ids, function(id) {
      return allWaypoints[id];
    });
  };

  Context = (function() {

    function Context($element) {
      var _this = this;
      this.$element = $element;
      this.element = $element[0];
      this.didResize = false;
      this.didScroll = false;
      this.id = contextCounter++;
      this.oldScroll = 0;
      this.waypoints = {};
      $element.data(contextKey, this.id);
      contexts[this.id] = this;
      $element.bind(scrollEvent, function() {
        var scrollHandler;
        if (!_this.didScroll) {
          _this.didScroll = true;
          scrollHandler = function() {
            _this.doScroll();
            return _this.didScroll = false;
          };
          return window.setTimeout(scrollHandler, $[wps].settings.scrollThrottle);
        }
      });
      $element.bind(resizeEvent, function() {
        var resizeHandler;
        if (!_this.didResize) {
          _this.didResize = true;
          resizeHandler = function() {
            $[wps]('refresh');
            return _this.didResize = false;
          };
          return window.setTimeout(resizeHandler, $[wps].settings.resizeThrottle);
        }
      });
    }

    Context.prototype.doScroll = function() {
      var direction, isDown, length, newScroll, waypointsHit,
        _this = this;
      newScroll = this.$element.scrollTop();
      isDown = newScroll > this.oldScroll;
      waypointsHit = [];
      $.each(this.waypoints, function(key, waypoint) {
        var hit, _ref, _ref1;
        if (isDown) {
          hit = (_this.oldScroll < (_ref = waypoint.offset) && _ref <= newScroll);
        } else {
          hit = (newScroll < (_ref1 = waypoint.offset) && _ref1 <= _this.oldScroll);
        }
        if (hit) {
          waypointsHit.push(waypoint);
        }
        return true;
      });
      length = waypointsHit.length;
      if (!(this.oldScroll && newScroll)) {
        $[wps]('refresh');
      }
      this.oldScroll = newScroll;
      if (!length) {
        return;
      }
      waypointsHit.sort(function(a, b) {
        return a.offset - b.offset;
      });
      if (!isDown) {
        waypointsHit.reverse();
      }
      direction = {
        down: isDown,
        up: !isDown
      };
      return $.each(waypointsHit, function(i, waypoint) {
        if (waypoint.options.continuous || i === length - 1) {
          return waypoint.trigger([direction]);
        }
      });
    };

    Context.prototype.refresh = function(waypoints) {
      var contextHeight, contextOffset, contextScroll, isWin,
        _this = this;
      isWin = $.isWindow(this.element);
      contextOffset = contextScroll = 0;
      contextHeight = $[wps]('viewportHeight');
      if (!isWin) {
        contextOffset = this.$element.offset().top;
        contextHeight = this.$element.height();
        contextScroll = this.$element.scrollTop();
      }
      if (waypoints == null) {
        waypoints = this.waypoints;
      }
      return $.each(waypoints, function(i, waypoint) {
        var adjustment, oldOffset, _ref, _ref1;
        adjustment = waypoint.options.offset;
        oldOffset = waypoint.offset;
        if ($.isFunction(waypoint.options.offset)) {
          adjustment = waypoint.options.offset.apply(waypoint.element);
        } else if (typeof waypoint.options.offset === 'string') {
          adjustment = parseFloat(waypoint.options.offset);
          if (waypoint.options.offset.indexOf('%')) {
            adjustment = Math.ceil(contextHeight * adjustment / 100);
          }
        }
        waypoint.offset = waypoint.$element.offset().top - contextOffset + contextScroll - adjustment;
        if (waypoint.options.onlyOnScroll || !waypoint.enabled) {
          return;
        }
        if (oldOffset !== null && (oldOffset < (_ref = _this.oldScroll) && _ref <= waypoint.offset)) {
          return waypoint.trigger([
            {
              down: false,
              up: true
            }
          ]);
        } else if (oldOffset !== null && (oldOffset > (_ref1 = _this.oldScroll) && _ref1 >= waypoint.offset)) {
          return waypoint.trigger([
            {
              down: true,
              up: false
            }
          ]);
        } else if (oldOffset === null && _this.$element.scrollTop() > waypoint.offset) {
          return waypoint.trigger([
            {
              down: true,
              up: false
            }
          ]);
        }
      });
    };

    Context.prototype.checkEmpty = function() {
      if ($.isEmptyObject(this.waypoints)) {
        return delete contexts[this.id];
      }
    };

    return Context;

  })();

  Waypoint = (function() {

    function Waypoint($element, context, options) {
      var idList, _ref;
      options = $.extend({}, $.fn[wp].defaults, options);
      if (options.offset === 'bottom-in-view') {
        options.offset = function() {
          var contextHeight;
          contextHeight = $[wps]('viewportHeight');
          if (!$.isWindow(context.element)) {
            contextHeight = context.$element.height();
          }
          return contextHeight - $(this).outerHeight();
        };
      }
      this.$element = $element;
      this.element = $element[0];
      this.options = options;
      this.offset = null;
      this.callback = options.handler;
      this.context = context;
      this.id = waypointCounter++;
      this.enabled = options.enabled;
      context.waypoints[this.id] = this;
      allWaypoints[this.id] = this;
      idList = (_ref = $element.data(waypointKey)) != null ? _ref : [];
      idList.push(this.id);
      $element.data(waypointKey, idList);
      $element.data('waypointPlugin', this);
    }

    Waypoint.prototype.trigger = function(args) {
      if (!this.enabled) {
        return;
      }
      if (this.callback != null) {
        this.callback.apply(this.element, args);
      }
      this.$element.trigger(waypointEvent, args);
      if (this.options.triggerOnce) {
        return this.destroy();
      }
    };

    Waypoint.prototype.disable = function() {
      return this.enabled = false;
    };

    Waypoint.prototype.enable = function() {
      this.context.refresh([this]);
      return this.enabled = true;
    };

    Waypoint.prototype.destroy = function() {
      delete allWaypoints[this.id];
      delete this.context.waypoints[this.id];
      return this.context.checkEmpty();
    };

    return Waypoint;

  })();

  methods = {
    init: function(f, options) {
      var _ref;
      if (options == null) {
        options = {};
      }
      if ((_ref = options.handler) == null) {
        options.handler = f;
      }
      this.each(function() {
        var $this, context, contextElement, _ref1;
        $this = $(this);
        contextElement = (_ref1 = options.context) != null ? _ref1 : $.fn[wp].defaults.context;
        if (!$.isWindow(contextElement)) {
          contextElement = $this.closest(contextElement);
        }
        contextElement = $(contextElement);
        context = contexts[contextElement.data(contextKey)];
        if (!context) {
          context = new Context(contextElement);
        }
        return new Waypoint($this, context, options);
      });
      $[wps]('refresh');
      return this;
    },
    disable: function() {
      return methods._invoke(this, 'disable');
    },
    enable: function() {
      return methods._invoke(this, 'enable');
    },
    destroy: function() {
      return methods._invoke(this, 'destroy');
    },
    _invoke: function($elements, method) {
      $elements.each(function() {
        var waypoints;
        waypoints = getWaypointsByElement(this);
        return $.each(waypoints, function(i, waypoint) {
          waypoint[method]();
          return true;
        });
      });
      return this;
    }
  };

  $.fn[wp] = function() {
    var args, method;
    method = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (methods[method]) {
      return methods[method].apply(this, args);
    } else if ($.isFunction(method) || !method) {
      return methods.init.apply(this, arguments);
    } else if ($.isPlainObject(method)) {
      return methods.init.apply(this, [null, method]);
    } else {
      return $.error("The " + method + " method does not exist in jQuery Waypoints.");
    }
  };

  $.fn[wp].defaults = {
    continuous: true,
    offset: 0,
    triggerOnce: false,
    context: window,
    enabled: true
  };

  jQMethods = {
    refresh: function() {
      return $.each(contexts, function(i, context) {
        return context.refresh();
      });
    },
    viewportHeight: function() {
      var _ref;
      return (_ref = window.innerHeight) != null ? _ref : $w.height();
    },
    aggregate: function() {
      var waypoints;
      waypoints = [];
      $.each(contexts, function(i, context) {
        return $.each(context.waypoints, function(j, waypoint) {
          return waypoints.push(waypoint);
        });
      });
      waypoints.sort(function(a, b) {
        return a.offset - b.offset;
      });
      waypoints = $.map(waypoints, function(waypoint) {
        return waypoint.element;
      });
      return $.unique(waypoints);
    }
  };

  $[wps] = function(method) {
    if (jQMethods[method]) {
      return jQMethods[method]();
    } else {
      return jQMethods.aggregate();
    }
  };

  $[wps].settings = {
    resizeThrottle: 200,
    scrollThrottle: 100
  };

  $w.load(function() {
    return $[wps]('refresh');
  });

}).call(this);
