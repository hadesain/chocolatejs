// Generated by CoffeeScript 1.9.2
(function() {
  var Action, Workflow, _, _module,
    slice = [].slice;

  _ = require('../../general/chocodash');

  Action = require('../locco/action');

  Workflow = _.prototype({
    adopt: {
      Status: {
        Public: 'public',
        Private: 'private'
      }
    },
    constructor: function(options) {
      var connect, is_ready, sync, when_ready;
      if (options == null) {
        options = {};
      }
      when_ready = new _.Publisher;
      is_ready = false;
      this.is_ready = function() {
        return is_ready;
      };
      this.actors = {};
      this.ready = function(func) {
        if (this.ws.readyState === 1) {
          return setTimeout(((function(_this) {
            return function() {
              is_ready = true;
              return func.call(_this);
            };
          })(this)), 0);
        } else {
          return when_ready.subscribe(((function(_this) {
            return function() {
              is_ready = true;
              return func.call(_this);
            };
          })(this)));
        }
      };
      sync = function() {
        var actions;
        actions = _["do"].flush();
        if (actions == null) {

        }
      };
      if (typeof module === "undefined" || module === null) {
        if ($ && $.websocket) {
          (connect = (function(_this) {
            return function() {
              var _id, callbacks;
              callbacks = {};
              _id = 1;
              _this.message_id = function(callback) {
                callbacks[_id.toString()] = callback;
                return _id++;
              };
              _this.ws = $.websocket("wss://" + window.location.host + "/~");
              _this.ws.onmessage = function(evt) {
                var callback, data, ref;
                if (options.debug) {
                  if (evt.data !== '') {
                    console.log("Message is received:" + evt.data);
                  }
                }
                data = JSON.parse(evt.data);
                if (data != null) {
                  if (data.result !== void 0 && data.id) {
                    callback = callbacks[data.id];
                    callback(data.result);
                    return delete callbacks[data.id];
                  } else {
                    if (((ref = data.console) != null ? ref.log : void 0) != null) {
                      return console.log(data.console.log);
                    }
                  }
                }
              };
              _this.ws.onopen = function() {
                var actor, id, ref;
                if (options.debug) {
                  console.log("Connection opened");
                }
                when_ready.notify();
                ref = _this.actors;
                for (id in ref) {
                  actor = ref[id];
                  actor.status.notify(Workflow.Status.Public);
                }
              };
              return _this.ws.onclose = function() {
                var actor, id, ref;
                if (options.debug) {
                  console.log("Connection closed. Reopening...");
                }
                setTimeout(connect, 300);
                ref = _this.actors;
                for (id in ref) {
                  actor = ref[id];
                  actor.status.notify(Workflow.Status.Private);
                }
              };
            };
          })(this))();
          return setInterval(sync, 300);
        }
      }
    },
    enter: function(actor) {
      return this.actors[actor.id()] = actor;
    },
    call: function() {
      var callback, i, location, module, name, object, param, params, ref, service;
      object = arguments[0], service = arguments[1], params = 4 <= arguments.length ? slice.call(arguments, 2, i = arguments.length - 1) : (i = 2, []), callback = arguments[i++];
      if (typeof window !== "undefined" && window !== null) {
        location = null;
        ref = window.modules;
        for (name in ref) {
          module = ref[name];
          if (module === object.constructor) {
            location = 'general/' + name;
            break;
          }
        }
        if (location == null) {
          location = window.location.pathname.substr(1);
        }
        if (service != null) {
          params = ((function() {
            var j, len, results;
            results = [];
            for (j = 0, len = params.length; j < len; j++) {
              param = params[j];
              results.push(_.param(param));
            }
            return results;
          })()).join('&');
          if (params.length > 0) {
            params = '&' + params;
          }
          return this.ws.send(JSON.stringify({
            url: "/" + location + "?" + service + params,
            id: this.message_id(callback)
          }));
        }
      }
    },
    execute: function(action) {
      var i, len, ref, results;
      ref = action.actions;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        action = ref[i];
        switch (so) {
          case 'go':
            break;
          default:
            results.push(void 0);
        }
      }
      return results;
    }
  });

  Workflow.main = new Workflow;

  Workflow.actor = function(id) {
    return Workflow.main.actors[id];
  };

  _module = typeof window !== "undefined" && window !== null ? window : module;

  if (_module.exports != null) {
    _module.exports = Workflow;
  } else {
    if (window.Locco == null) {
      window.Locco = {};
    }
    window.Locco.Workflow = Workflow;
  }

}).call(this);
