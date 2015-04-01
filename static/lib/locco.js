if (typeof window !== "undefined" && window !== null) { window.previousExports = window.exports; window.exports = {} };
// Generated by CoffeeScript 1.7.1

/*
    Intention
    Data
    Action
    Document
    Workflow
    Interface
    Actor
    Reserve
    Prototype
 */

(function() {
  var previousRequire, require, resolve, use_cache, _ref;

  if ((typeof window !== "undefined" && window !== null) && (((_ref = window.modules) != null ? _ref.locco : void 0) == null)) {
    window.modules = {
      locco: window[window.exports != null ? "exports" : "Locco"] = {}
    };
    if (!($ && $.ajax)) {
      if (window.require == null) {
        window.require = function() {
          return window.exports;
        };
      }
      return;
    }
    previousRequire = window.require;
    use_cache = true;
    window.require = require = function(modulename, filename, options) {
      var cachedModule, result, url, _previousExports, _previous_use_cache;
      if (arguments.length === 2 && Object.prototype.toString.apply(filename !== '[object String]')) {
        options = filename;
        filename = null;
      }
      if (filename == null) {
        filename = modulename;
      }
      filename = resolve(filename);
      if ((options != null ? options.use_cache : void 0) != null) {
        _previous_use_cache = use_cache;
        use_cache = options.use_cache;
      }
      result = typeof previousRequire === "function" ? previousRequire(filename) : void 0;
      if (result != null) {
        return result;
      }
      if (use_cache) {
        cachedModule = window.modules[filename];
        if (cachedModule != null) {
          return cachedModule;
        }
      }
      _previousExports = window.exports;
      window.exports = {};
      url = '/static/lib/' + filename + '.js';
      $.ajax({
        url: url,
        async: false,
        cache: true,
        error: function(type, xhr, settings) {
          return console.log('require("' + url + '") failed' + (xhr.status != null ? ' with error ' + (xhr.status != null) : ''));
        },
        dataType: 'script'
      });
      result = window.modules[filename] = window.exports;
      window.exports = _previousExports;
      if ((options != null ? options.use_cache : void 0) != null) {
        use_cache = _previous_use_cache;
      }
      return result;
    };
    window.require.resolve = resolve = function(filename) {
      var i;
      filename = filename.toLowerCase().replace(/^\.\//, '').replace(/\.\.\//g, '').replace(/^general\//, '').replace(/^client\//, '').replace(/^server\//, '');
      return filename = (i = filename.lastIndexOf('.')) >= 0 ? filename.slice(0, i) : filename;
    };
    window.require.cache = function(used) {
      return use_cache = used;
    };
  }

}).call(this);

if (typeof window !== "undefined" && window !== null) { window.modules['locco/intention'] = window.exports; window.exports = window.previousExports };

if (typeof window !== "undefined" && window !== null) { window.previousExports = window.exports; window.exports = {} };
// Generated by CoffeeScript 1.7.1
(function() {
  var Data, _, _module;

  _ = require('../../general/chocodash');

  Data = _.prototype({
    constructor: function(uuid, name, data) {
      this.uuid = uuid != null ? uuid : _.Uuid();
      this.name = name;
      this.data = data;
    }
  });

  _module = typeof window !== "undefined" && window !== null ? window : module;

  if (_module.exports != null) {
    _module.exports = Data;
  } else {
    if (window.Locco == null) {
      window.Locco = {};
    }
    window.Locco.Data = Data;
  }

}).call(this);

if (typeof window !== "undefined" && window !== null) { window.modules['locco/data'] = window.exports; window.exports = window.previousExports };

if (typeof window !== "undefined" && window !== null) { window.previousExports = window.exports; window.exports = {} };
// Generated by CoffeeScript 1.7.1
(function() {
  var Action, _, _module;

  _ = require('../../general/chocodash');

  Action = _.prototype({
    constructor: function() {
      return this.actions = [];
    },
    "do": function(what, value, type) {
      this.actions.push({
        so: 'do',
        what: what,
        value: value
      });
      return this;
    },
    move: function(what, where, how) {
      this.actions.push({
        so: 'move',
        what: what,
        where: where,
        how: how
      });
      return this;
    },
    "eval": function(what, value) {
      this.actions.push({
        so: 'eval',
        what: what,
        value: value
      });
      return this;
    },
    go: function(what, where) {
      if (where == null) {
        where = Action.go.Where.Inside;
      }
      this.actions.push({
        so: 'go',
        what: what,
        where: where
      });
      return this;
    }
  });

  Action.prototype["do"].What = {
    New: 0,
    Set: 1,
    Delete: 2
  };

  Action.prototype.move.How = {
    Replace: 0,
    Append: 1,
    Prepend: 2,
    InsertBefore: 3,
    InsertAfter: 4
  };

  Action.prototype.go.Where = {
    Front: 0,
    Inside: 1,
    Through: 2
  };

  _module = typeof window !== "undefined" && window !== null ? window : module;

  if (_module.exports != null) {
    _module.exports = Action;
  } else {
    if (window.Locco == null) {
      window.Locco = {};
    }
    window.Locco.Action = Action;
  }

}).call(this);

if (typeof window !== "undefined" && window !== null) { window.modules['locco/action'] = window.exports; window.exports = window.previousExports };

if (typeof window !== "undefined" && window !== null) { window.previousExports = window.exports; window.exports = {} };
// Generated by CoffeeScript 1.7.1
(function() {
  var Data, Document, _, _module;

  _ = require('../../general/chocodash');

  Data = require('../../general/locco/data');

  Document = _.prototype({
    constructor: function(definition) {
      var helpers, methodName, _i, _len, _ref;
      helpers = {
        set: function(key, value) {
          _["do"].set(this.definition, key, value);
          return this.value(this.definition);
        }
      };
      _ref = ["pop", "push", "reverse", "shift", "sort", "splice", "unshift"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        methodName = _ref[_i];
        helpers[methodName] = (function(methodName) {
          return function() {
            var result;
            Array.prototype.unshift.call(arguments, this.definition);
            result = _["do"][methodName].apply(null, arguments);
            this.value(this.definition);
            return result;
          };
        })(methodName);
      }
      return this.signal = new _.Signal(definition, helpers);
    },
    use: function() {
      var methodName, _i, _len, _ref, _results;
      this.set = function(key, value) {
        return this.signal.set(key, value);
      };
      this["delete"] = function(key) {
        return this.signal["delete"](key);
      };
      this.get = function() {
        return this.signal.value();
      };
      _ref = ["pop", "push", "reverse", "shift", "sort", "splice", "unshift"];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        methodName = _ref[_i];
        _results.push(this[methodName] = (function(methodName) {
          return function() {
            var output;
            output = this.signal[methodName].apply(this.signal, arguments);
            return output;
          };
        })(methodName));
      }
      return _results;
    }
  });

  _module = typeof window !== "undefined" && window !== null ? window : module;

  if (_module.exports != null) {
    _module.exports = Document;
  } else {
    if (window.Locco == null) {
      window.Locco = {};
    }
    window.Locco.Document = Document;
  }

}).call(this);

if (typeof window !== "undefined" && window !== null) { window.modules['locco/document'] = window.exports; window.exports = window.previousExports };

if (typeof window !== "undefined" && window !== null) { window.previousExports = window.exports; window.exports = {} };
// Generated by CoffeeScript 1.7.1
(function() {
  var Action, Workflow, _, _module,
    __slice = [].slice;

  _ = require('../../general/chocodash');

  Action = require('../locco/action');

  Workflow = _.prototype({
    constructor: function(options) {
      var connect, is_ready, sync;
      if (options == null) {
        options = {};
      }
      is_ready = new _.Publisher;
      this.actors = {};
      this.ready = function(func) {
        if (this.ws.readyState === 1) {
          return setTimeout(((function(_this) {
            return function() {
              return func.call(_this);
            };
          })(this)), 0);
        } else {
          return is_ready.subscribe(((function(_this) {
            return function() {
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
              var callbacks, id;
              callbacks = {};
              id = 1;
              _this.message_id = function(callback) {
                callbacks[id.toString()] = callback;
                return id++;
              };
              _this.ws = $.websocket("wss://" + window.location.host + "/~");
              _this.ws.onmessage = function(evt) {
                var callback, data;
                if (options.debug) {
                  if (evt.data !== '') {
                    console.log("Message is received:" + evt.data);
                  }
                }
                data = _.parse(evt.data);
                if ((data != null) && data.result !== void 0 && data.id) {
                  callback = callbacks[data.id];
                  callback(data.result);
                  return delete callbacks[data.id];
                }
              };
              _this.ws.onopen = function() {
                if (options.debug) {
                  console.log("Connection opened");
                }
                return is_ready.notify();
              };
              return _this.ws.onclose = function() {
                if (options.debug) {
                  console.log("Connection closed. Reopening...");
                }
                return setTimeout(connect, 300);
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
    broadcast: function() {
      var callback, location, module, name, object, param, params, service, _i, _ref;
      object = arguments[0], service = arguments[1], params = 4 <= arguments.length ? __slice.call(arguments, 2, _i = arguments.length - 1) : (_i = 2, []), callback = arguments[_i++];
      if (typeof window !== "undefined" && window !== null) {
        location = null;
        _ref = window.modules;
        for (name in _ref) {
          module = _ref[name];
          if (module === object.constructor) {
            location = 'general/' + name;
            break;
          }
        }
        if ((location != null) && (service != null)) {
          params = ((function() {
            var _j, _len, _results;
            _results = [];
            for (_j = 0, _len = params.length; _j < _len; _j++) {
              param = params[_j];
              _results.push(_.param(param));
            }
            return _results;
          })()).join('&');
          if (params.length > 0) {
            params = '&' + params;
          }
          return this.ws.send("{url:'/" + location + "?" + service + params + "', id:" + (this.message_id(callback)) + "}");
        }
      }
    },
    execute: function(action) {
      var _i, _len, _ref, _results;
      _ref = action.actions;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        action = _ref[_i];
        switch (so) {
          case 'go':
            break;
          default:
            _results.push(void 0);
        }
      }
      return _results;
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

if (typeof window !== "undefined" && window !== null) { window.modules['locco/workflow'] = window.exports; window.exports = window.previousExports };

if (typeof window !== "undefined" && window !== null) { window.previousExports = window.exports; window.exports = {} };
// Generated by CoffeeScript 1.7.1
(function() {
  var Chocokup, Interface, _, _module,
    __hasProp = {}.hasOwnProperty,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('../../general/chocodash');

  Chocokup = require('../../general/chocokup');

  Interface = _.prototype({
    constructor: function(service) {
      var item, name;
      if (typeof service === 'function') {
        service = {
          action: service
        };
      }
      if (service != null) {
        if (service.defaults != null) {
          if (typeof service.defaults === 'function') {
            this.defaults = service.defaults;
          } else {
            this.defaults = _.defaults(this.defaults, service.defaults);
          }
        }
        if (service.locks != null) {
          this.locks = _.defaults(this.locks, service.locks);
        }
        if (service.values != null) {
          this.values = _.defaults(this.values, service.values);
        }
        if (service.steps != null) {
          this.steps = _.defaults(this.steps, service.steps);
        }
        for (name in service) {
          item = service[name];
          if (name !== 'defaults' && name !== 'locks' && name !== 'values' && name !== 'steps') {
            this[name] = item;
          }
        }
      }
    },
    bind: function(actor, document, name) {
      this.name = name;
      if (!((this.actor != null) && (this.document != null))) {
        this.actor = actor;
        this.document = document;
        switch (_.type(this.update)) {
          case _.Type.Function:
            return this.observe(this.update);
          case _.Type.String:
            return this.observe((function(_this) {
              return function(html) {
                $(_this.update).html(html);
              };
            })(this));
        }
      }
    },
    review: function(bin, scope, reaction, next) {
      var check, check_services, review_result, _ref, _ref1;
      check = {
        defaults: (function(_this) {
          return function(object, defaults) {
            var set;
            if (typeof defaults === 'function') {
              defaults = defaults.call(_this);
            }
            set = function(o, d) {
              var dk, dv;
              for (dk in d) {
                if (!__hasProp.call(d, dk)) continue;
                dv = d[dk];
                if (_.isBasicObject(o[dk]) && _.isBasicObject(dv)) {
                  set(o[dk], dv);
                } else {
                  if (o[dk] == null) {
                    o[dk] = dv;
                  }
                }
              }
              return o;
            };
            return set(object, defaults);
          };
        })(this),
        locks: (function(_this) {
          return function(keys, locks) {
            var lock, _i, _len;
            if (locks == null) {
              return true;
            }
            if (typeof locks === 'function') {
              locks = locks.call(_this);
            }
            for (_i = 0, _len = locks.length; _i < _len; _i++) {
              lock = locks[_i];
              if (__indexOf.call(keys, lock) < 0) {
                return false;
              }
            }
            return true;
          };
        })(this),
        values: function(bin, controller) {
          return controller.call(bin);
        }
      };
      check_services = function() {
        var was_synchronous;
        was_synchronous = true;
        _.serialize(function(step) {
          var check_service;
          check_service = function(service_bin, local_scope) {
            var name, service, _local_scope;
            for (name in service_bin) {
              service = service_bin[name];
              if (service instanceof Interface) {
                (function(_bin, _name, _service, _local_scope) {
                  return step(function(next_service) {
                    var item, service_result, _base, _i, _j, _len, _len1, _next_service;
                    if ((_base = _bin[_name]).bin == null) {
                      _base.bin = {
                        __: _bin.__
                      };
                    }
                    if (_local_scope != null) {
                      for (_i = 0, _len = _local_scope.length; _i < _len; _i++) {
                        item = _local_scope[_i];
                        scope.global.push(item);
                      }
                      _next_service = next_service;
                      next_service = function() {
                        var _j, _len1;
                        for (_j = 0, _len1 = _local_scope.length; _j < _len1; _j++) {
                          item = _local_scope[_j];
                          scope.global.pop();
                        }
                        return _next_service();
                      };
                    }
                    service_result = _service.review(_bin[_name].bin, scope, reaction, next_service);
                    if (service_result === next_service) {
                      was_synchronous = false;
                    } else {
                      if (_local_scope != null) {
                        for (_j = 0, _len1 = _local_scope.length; _j < _len1; _j++) {
                          item = _local_scope[_j];
                          scope.global.pop();
                        }
                      }
                      next_service();
                    }
                    return service_result;
                  });
                })(service_bin, name, service, local_scope != null ? local_scope.slice(0) : null);
              } else {
                if (_.isBasicObject(service)) {
                  _local_scope = local_scope != null ? local_scope.slice(0) : [];
                  _local_scope.push(name);
                  check_service(service, _local_scope);
                }
              }
            }
          };
          check_service(bin);
          return step(false, function() {
            return next();
          });
        });
        if (was_synchronous) {
          return null;
        } else {
          return next;
        }
      };
      if (reaction.certified == null) {
        reaction.certified = true;
      }
      if (this.defaults != null) {
        check.defaults(bin, this.defaults);
      }
      if (this.locks != null) {
        reaction.certified = check.locks((_ref = bin.__) != null ? (_ref1 = _ref.session) != null ? _ref1.keys : void 0 : void 0, this.locks);
      }
      if (this.values != null) {
        reaction.certified = check.values(bin, this.values);
      }
      if (reaction.certified && (this.steps != null)) {
        review_result = this.steps.call({
          bin: bin,
          document: this.document,
          'interface': this,
          actor: this.actor,
          reaction: reaction
        }, {
          bin: bin,
          document: this.document,
          'interface': this,
          actor: this.actor,
          reaction: reaction,
          next: check_services
        });
      }
      switch (review_result) {
        case check_services:
          return next;
        case void 0:
          return check_services();
        default:
          return null;
      }
    },
    submit: function(bin) {
      var publisher, reaction;
      if (bin == null) {
        bin = {};
      }
      publisher = new _.Publisher;
      reaction = new Interface.Reaction;
      _.serialize(this, function(step) {
        step(function(next) {
          var result;
          result = this.review(bin, {
            global: [],
            local: []
          }, reaction, next);
          if (result !== next) {
            return next();
          }
        });
        step(function(next) {
          var result;
          if (reaction.certified && (this.action != null)) {
            result = this.action.call({
              bin: bin,
              document: this.document,
              'interface': this,
              actor: this.actor,
              reaction: reaction
            }, {
              bin: bin,
              document: this.document,
              'interface': this,
              actor: this.actor,
              reaction: reaction,
              next: next
            });
          }
          if (!((reaction.bin != null) || result === next)) {
            reaction.bin = result;
          }
          if (result !== next) {
            return next();
          }
        });
        return step(false, function() {
          return publisher.notify(reaction);
        });
      });
      return publisher;
    },
    observe: function(action) {
      return new _.Observer((function(_this) {
        return function() {
          var _ref;
          if ((_ref = _this.document.signal) != null) {
            _ref.value();
          }
          return _this.submit().subscribe(function(_arg) {
            var bin;
            bin = _arg.bin;
            return action(bin.render());
          });
        };
      })(this));
    }
  });

  Interface.Reaction = _.prototype({
    constructor: function(bin, certified) {
      this.bin = bin;
      this.certified = certified;
    }
  });

  Interface.Web = _.prototype({
    inherit: Interface,
    use: function() {
      this.type = 'App';
      this.review = function(bin, scope, reaction, next) {
        _.serialize(this, function(step) {
          step(function(next) {
            var result;
            result = _["super"](Interface.Web.prototype.review, this, bin, scope, reaction, next);
            if (result !== next) {
              return next();
            }
          });
          return step(false, function() {
            var check_interfaces;
            reaction.bin = '';
            scope.local.length = 0;
            check_interfaces = function(bin) {
              var k, kups, local_kups, name, service, _i, _len, _ref, _ref1, _ref2, _ref3;
              for (name in bin) {
                service = bin[name];
                if (service instanceof Interface.Web) {
                  kups = reaction.kups != null ? reaction.kups : reaction.kups = {};
                  _ref = scope.global;
                  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    step = _ref[_i];
                    kups = kups[step] != null ? kups[step] : kups[step] = {};
                  }
                  local_kups = '';
                  if (scope.global.length > 0) {
                    local_kups = ((function() {
                      var _results;
                      _results = [];
                      for (k in kups) {
                        _results.push("" + k + " = " + (scope.global.join('.')) + "." + k);
                      }
                      return _results;
                    })()).join(', ');
                    if (local_kups !== "") {
                      local_kups = "\nvar " + local_kups + ";";
                    }
                  }
                  if (kups[name] == null) {
                    kups[name] = new Function('o', "var interface = this.interface, bin = this.bin, actor = this.actor, __hasProp = {}.hasOwnProperty;" + local_kups + "\nthis.interface = bin" + (scope.local.length > 0 ? '.' + scope.local.join('.') : '') + "." + name + ";\nthis.actor = this.interface != null ? this.interface.actor : null;\nthis.bin = this.interface != null ? (this.interface.bin != null ? this.interface.bin : {}) : {};\nif (o != null) {\n    for (k in o) {\n        if (hasOwnProperty.call(o, k)) {\n            this.bin[k] = o[k];\n        }\n    }\n}\n(" + (((_ref1 = (_ref2 = service.action) != null ? _ref2.overriden : void 0) != null ? _ref1 : service.action).toString()) + ").call(this);\nthis.bin = bin; this.interface = interface, this.actor = actor;");
                  }
                  if (((_ref3 = bin[name]) != null ? _ref3.bin : void 0) != null) {
                    check_interfaces(bin[name].bin);
                  }
                } else {
                  if (_.isBasicObject(service)) {
                    scope.global.push(name);
                    scope.local.push(name);
                    check_interfaces(service);
                    scope.local.pop();
                    scope.global.pop();
                  }
                }
              }
            };
            check_interfaces(bin);
            return next();
          });
        });
        return next;
      };
      return this.submit = function(bin) {
        var callback, chocokup_code, result, _ref, _ref1;
        if (!((_ref = this.action) != null ? _ref.overriden : void 0)) {
          chocokup_code = (_ref1 = this.action) != null ? _ref1 : function() {};
          this.action = (function(_this) {
            return function(_arg) {
              var bin, kups, options, reaction;
              bin = _arg.bin, reaction = _arg.reaction;
              if (bin == null) {
                bin = {};
              }
              kups = reaction.kups;
              delete reaction.kups;
              options = {
                bin: bin,
                document: _this.document,
                'interface': _this,
                actor: _this.actor,
                kups: kups
              };
              if (bin.theme != null) {
                options.theme = bin.theme;
              }
              if (bin.with_coffee != null) {
                options.with_coffee = bin.with_coffee;
              }
              if (bin.manifest != null) {
                options.manifest = bin.manifest;
              }
              return reaction.bin = (function() {
                var _ref2;
                switch (this.type) {
                  case 'Panel':
                    return new Chocokup.Panel(options, chocokup_code);
                  default:
                    return new Chocokup[this.type]((_ref2 = bin != null ? bin.name : void 0) != null ? _ref2 : '', options, chocokup_code);
                }
              }).call(_this);
            };
          })(this);
          this.action.overriden = chocokup_code;
        }
        if (typeof bin === 'function') {
          callback = bin;
          bin = {};
        }
        result = _["super"](this, bin);
        if (callback != null) {
          result.subscribe(function(reaction) {
            return callback(reaction.bin.render());
          });
        }
        return result;
      };
    }
  });

  Interface.Web.App = Interface.Web;

  Interface.Web.Document = _.prototype({
    inherit: Interface.Web,
    use: function() {
      return this.type = 'Document';
    }
  });

  Interface.Web.Panel = _.prototype({
    inherit: Interface.Web,
    use: function() {
      return this.type = 'Panel';
    }
  });

  _module = typeof window !== "undefined" && window !== null ? window : module;

  if (_module.exports != null) {
    _module.exports = Interface;
  } else {
    if (window.Locco == null) {
      window.Locco = {};
    }
    window.Locco.Interface = Interface;
  }

}).call(this);

if (typeof window !== "undefined" && window !== null) { window.modules['locco/interface'] = window.exports; window.exports = window.previousExports };

if (typeof window !== "undefined" && window !== null) { window.previousExports = window.exports; window.exports = {} };
// Generated by CoffeeScript 1.7.1
(function() {
  var Actor, Document, Interface, Workflow, _, _module;

  _ = require('../../general/chocodash');

  Interface = require('../locco/interface');

  Workflow = require('../locco/workflow');

  Document = require('../locco/document');

  Actor = _.prototype({
    adopt: {
      go: function(where, callback) {
        return _.go(where, callback);
      },
      awake: function(uuid, __) {
        var publisher;
        if (typeof window === "undefined" || window === null) {
          if ((uuid != null) && (__.session.frozen != null) && (__.session.frozen[uuid] == null)) {
            return void 0;
          }
          publisher = new _.Publisher;
          __.space.read(uuid, function(frozen) {
            return publisher.notify(frozen);
          });
          return publisher;
        }
      }
    },
    constructor: function(options) {
      var doc, is_ready, k, v, _bind, _ref;
      is_ready = new _.Publisher;
      this.ready = function(callback) {
        return is_ready.subscribe(((function(_this) {
          return function() {
            return callback.call(_this);
          };
        })(this)));
      };
      this.stage = (_ref = options != null ? options.workflow : void 0) != null ? _ref : Workflow.main;
      is_ready.subscribe(((function(_this) {
        return function() {
          return _this.stage.enter(_this);
        };
      })(this)));
      if (typeof window !== "undefined" && window !== null) {
        this.stage.ready((function(_this) {
          return function() {
            return _this.stage.broadcast(_this, 'awake', options != null ? options.uuid : void 0, {
              how: 'json'
            }, function(frozen) {
              var k, v;
              if (frozen != null) {
                for (k in frozen) {
                  v = frozen[k];
                  _this[k] = v;
                }
              }
              return is_ready.notify();
            });
          };
        })(this));
      } else {
        setTimeout((function() {
          return is_ready.notify();
        }), 0);
      }
      for (k in this) {
        v = this[k];
        if (v instanceof Document) {
          doc = v;
          break;
        }
      }
      if (doc == null) {
        doc = {};
      }
      for (k in this) {
        v = this[k];
        if (v instanceof Actor) {
          _["do"].internal(v, 'parent', this);
        }
      }
      _bind = (function(_this) {
        return function(o) {
          for (k in o) {
            v = o[k];
            if (v instanceof Interface) {
              v.bind(_this, doc, k);
            } else if (v.constructor === {}.constructor) {
              _bind(v);
            }
          }
        };
      })(this);
      _bind(this);
    },
    id: function() {
      var _ref, _ref1;
      if (((_ref = this._) != null ? (_ref1 = _ref._) != null ? _ref1.uuid : void 0 : void 0) == null) {
        _["do"].identify(this, {
          filter: [Document]
        });
      }
      return this._._.uuid;
    },
    show: function() {},
    area: function(name, id) {
      var k, set, v;
      _["do"].internal(this, 'area', {});
      set = (function(_this) {
        return function(k, v) {
          var area, parent, _ref, _ref1;
          if (v == null) {
            if (_this._._.area[k] != null) {
              return _this._._.area[k];
            }
            parent = _this;
            while ((parent = (_ref = parent._) != null ? (_ref1 = _ref._) != null ? _ref1.parent : void 0 : void 0) != null) {
              if ((area = parent.area(k)) != null) {
                return area;
              }
            }
          } else {
            return _this._._.area[k] = v;
          }
        };
      })(this);
      if (_.isBasicObject(name)) {
        for (k in name) {
          v = name[k];
          set(k, v);
        }
      } else {
        return set(name, id);
      }
    }
  });

  Actor.Web = _.prototype({
    inherit: Actor,
    use: function() {
      var _shown;
      _shown = {};
      return this.show = function(path, source, area) {
        var step, steps, where, _i, _len, _ref;
        steps = path.split('.');
        where = this;
        for (_i = 0, _len = steps.length; _i < _len; _i++) {
          step = steps[_i];
          where = where[step];
          if (where == null) {
            return;
          }
        }
        if (area == null) {
          area = (_ref = where.area) != null ? _ref : 'inline';
        }
        switch (area) {
          case 'inline':
            return typeof where.submit === "function" ? where.submit(function(result) {
              var uuid, _ref1;
              if (((uuid = _shown[path]) == null) || $("#" + uuid).length === 0) {
                uuid = _shown[path] = '_' + _.Uuid();
                result = "<div id='" + uuid + "'>" + result + "</div>";
                if (!source.after) {
                  source = $(source);
                }
                return (_ref1 = source.after) != null ? _ref1.call(source, result) : void 0;
              }
            }) : void 0;
          case 'view':
            break;
          case 'modal':
            break;
          case 'popup':
        }
      };
    }
  });

  _module = typeof window !== "undefined" && window !== null ? window : module;

  if (_module.exports != null) {
    _module.exports = Actor;
  } else {
    if (window.Locco == null) {
      window.Locco = {};
    }
    window.Locco.Actor = Actor;
  }

}).call(this);

if (typeof window !== "undefined" && window !== null) { window.modules['locco/actor'] = window.exports; window.exports = window.previousExports };

if (typeof window !== "undefined" && window !== null) { window.previousExports = window.exports; window.exports = {} };
// Generated by CoffeeScript 1.7.1
(function() {
  var Reserve, TransientReserve, Workflow, _, _module;

  _ = require('../../general/chocodash');

  Workflow = require('../locco/workflow');

  TransientReserve = _.prototype({
    use: function() {
      var all;
      all = {};
      return this.Space = {
        read: function(uuid) {
          return all[uuid];
        },
        write: function(io) {
          return all[io.uuid] = io;
        },
        forget: function(io) {
          return delete all[io.uuid];
        }
      };
    }
  });

  Reserve = typeof module !== "undefined" && module !== null ? require("../../server/reserve") : new TransientReserve;

  _module = typeof window !== "undefined" && window !== null ? window : module;

  if (_module.exports != null) {
    _module.exports = Reserve;
  } else {
    if (window.Locco == null) {
      window.Locco = {};
    }
    window.Locco.Reserve = Reserve;
  }

}).call(this);

if (typeof window !== "undefined" && window !== null) { window.modules['locco/reserve'] = window.exports; window.exports = window.previousExports };

if (typeof window !== "undefined" && window !== null) { window.previousExports = window.exports; window.exports = {} };
// Generated by CoffeeScript 1.7.1

/*
 - reference du prototype créé au moment de la sauvegarde dans reserve d'un objet javascript
 - reference est un uuid lié au chemin du fichier à partir de /general
 - les uuid sont stockés dans la base de donnée en tant qu'objet avec 
   - id = uuid 
   - type de container = Prototype.javascript 
   - ancestors = concaténation des uuid des parents 
   - path = chemin vers le source
 - stockage de la référence du prototype : dans la bdd avec le type de container Data.Binary.Uuid.family ; dans l'objet en tant que propriété sous _
 - lors de la désérialisation, si l'on tombe sur une propriété de type Prototype.javascript, 
   on remplace le parent par une nouvelle instance de la classe en question...
 */

(function() {
  var Prototype, _, _module;

  _ = require('../../general/chocodash');

  Prototype = _.prototype({
    constructor: function() {}
  });

  _module = typeof window !== "undefined" && window !== null ? window : module;

  if (_module.exports != null) {
    _module.exports = Prototype;
  } else {
    if (window.Locco == null) {
      window.Locco = {};
    }
    window.Locco.Prototype = Prototype;
  }

}).call(this);

if (typeof window !== "undefined" && window !== null) { window.modules['locco/prototype'] = window.exports; window.exports = window.previousExports };

