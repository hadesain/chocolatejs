// Generated by CoffeeScript 1.9.2
(function() {
  var Actor, Chocokup, Document, Interface, Workflow, _, _module,
    slice = [].slice;

  _ = require('../../general/chocodash');

  Interface = require('../locco/interface');

  Workflow = require('../locco/workflow');

  Document = require('../locco/document');

  Chocokup = require('chocolate/general/chocokup');

  Actor = _.prototype({
    adopt: {
      go: function(who, where, callback) {
        return _.go(who[where], function() {
          callback.apply(who, arguments);
          if (who.stage.is_ready()) {
            return who.status.notify(Workflow.Status.Public);
          }
        });
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
      var _bind, doc, k, ref, v, when_ready;
      when_ready = new _.Publisher;
      this.ready = function(callback) {
        return when_ready.subscribe(((function(_this) {
          return function() {
            return callback.call(_this);
          };
        })(this)));
      };
      this.stage = (ref = options != null ? options.workflow : void 0) != null ? ref : Workflow.main;
      when_ready.subscribe(((function(_this) {
        return function() {
          return _this.stage.enter(_this);
        };
      })(this)));
      if (typeof window !== "undefined" && window !== null) {
        this.stage.ready((function(_this) {
          return function() {
            return _this.stage.call(_this, 'awake', options != null ? options.uuid : void 0, {
              how: 'json'
            }, function(frozen) {
              var k, v;
              if (frozen != null) {
                for (k in frozen) {
                  v = frozen[k];
                  _this[k] = v;
                }
              }
              return when_ready.notify();
            });
          };
        })(this));
      } else {
        setTimeout((function() {
          return when_ready.notify();
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
        doc = new Document({});
      }
      this.document = doc;
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
            } else if ((v != null ? v.constructor : void 0) === {}.constructor) {
              _bind(v);
            }
          }
        };
      })(this);
      _bind(this);
    },
    id: function() {
      var ref, ref1;
      if (((ref = this._) != null ? (ref1 = ref._) != null ? ref1.uuid : void 0 : void 0) == null) {
        _["do"].identify(this, {
          filter: [Document]
        });
      }
      return this._._.uuid;
    },
    status: new _.Publisher,
    submit: function() {
      var params, publisher, ref, service;
      service = arguments[0], params = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      publisher = new _.Publisher;
      if ((typeof window !== "undefined" && window !== null) && this.stage.is_ready()) {
        (ref = this.stage).call.apply(ref, [this, service].concat(slice.call(params), [function(data) {
          return publisher.notify(data);
        }]));
      } else {
        setTimeout((function() {
          return publisher.notify();
        }), 0);
      }
      return publisher;
    },
    show: function() {},
    area: function(name, id) {
      var k, set, v;
      _["do"].internal(this, 'area', {});
      set = (function(_this) {
        return function(k, v) {
          var area, parent, ref, ref1;
          if (v == null) {
            if (_this._._.area[k] != null) {
              return _this._._.area[k];
            }
            parent = _this;
            while ((parent = (ref = parent._) != null ? (ref1 = ref._) != null ? ref1.parent : void 0 : void 0) != null) {
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
      this.show = function(path, source, area) {
        var j, len, ref, step, steps, where;
        steps = path.split('.');
        where = this;
        for (j = 0, len = steps.length; j < len; j++) {
          step = steps[j];
          where = where[step];
          if (where == null) {
            return;
          }
        }
        if (area == null) {
          area = (ref = where.area) != null ? ref : 'inline';
        }
        switch (area) {
          case 'inline':
            return typeof where.submit === "function" ? where.submit(function(result) {
              var ref1, uuid;
              if (((uuid = _shown[path]) == null) || $("#" + uuid).length === 0) {
                uuid = _shown[path] = '_' + _.Uuid();
                result = "<div id='" + uuid + "'>" + result + "</div>";
                if (!source.after) {
                  source = $(source);
                }
                return (ref1 = source.after) != null ? ref1.call(source, result) : void 0;
              }
            }) : void 0;
          case 'view':
            break;
          case 'modal':
            break;
          case 'popup':
        }
      };
      this["interface"] = new Interface.Web({
        defaults: function() {
          var basename, end, filename, i, j, ref, ref1, ref2, ref3, ref4, ref5, ref6, start;
          if ((filename = (ref = this.actor.options) != null ? ref.filename : void 0) != null) {
            start = end = null;
            for (i = j = 0, ref1 = filename.length; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
              if ((ref2 = filename[filename.length - 1 - i]) === '/' || ref2 === '\\') {
                start = filename.length - i;
                if (end == null) {
                  end = filename.length;
                }
                break;
              }
              if (filename[filename.length - 1 - i] === '.') {
                end = filename.length - i - 1;
              }
            }
            if (start == null) {
              start = 0;
            }
            if (end == null) {
              end = filename.length;
            }
            basename = filename.substring(start, end);
          }
          return {
            options: this.actor.options,
            name: (ref3 = (ref4 = (ref5 = this.actor.options) != null ? ref5.name : void 0) != null ? ref4 : basename) != null ? ref3 : '',
            theme: 'writer',
            manifest: (basename != null ? basename : '/') + "?manifest&how=manifest",
            actor: {
              source: "var Service = (" + (_.stringify((ref6 = this.actor.constructor.__prototyper__) != null ? ref6 : function() {
                return {};
              })) + ")();"
            }
          };
        },
        render: function() {
          var href, j, l, len, len1, ref, ref1, ref2, ref3, ref4, ref5, ref6, src;
          ref2 = ((ref = (ref1 = this.props.options) != null ? ref1.script : void 0) != null ? ref : '').split('\n');
          for (j = 0, len = ref2.length; j < len; j++) {
            src = ref2[j];
            script({
              src: src,
              charset: "utf-8"
            });
          }
          ref5 = ((ref3 = (ref4 = this.props.options) != null ? ref4.stylesheet : void 0) != null ? ref3 : '').split('\n');
          for (l = 0, len1 = ref5.length; l < len1; l++) {
            href = ref5[l];
            link({
              rel: "stylesheet",
              href: href
            });
          }
          script(function() {
            return text(this.props.actor.source);
          });
          return coffeescript({
            main: (ref6 = this.props.options) != null ? ref6.main : void 0
          }, function() {
            return $(function() {
              var cache;
              Workflow = require('general/locco/workflow');
              Actor = require('general/locco/actor');
              if (window.applicationCache != null) {
                (cache = window.applicationCache).addEventListener('updateready', function(e) {
                  if (cache.status === cache.UPDATEREADY) {
                    cache.swapCache();
                    return window.location.reload();
                  }
                });
              }
              return Workflow.main.ready(function() {
                var service;
                service = new Service;
                return service.ready(function() {
                  return Actor.go(service, typeof main !== "undefined" && main !== null ? main : 'main', function(str) {
                    return $('body').html(str);
                  });
                });
              });
            });
          });
        }
      });
      return this.manifest = function(__) {
        var Fs, filename, j, l, len, len1, line, pathname, ref, ref1, ref2, ref3, ref4, ref5, stats, time_stamps, time_stamps_list, to_cache, to_cache_list;
        Fs = require('fs');
        to_cache = Chocokup.App.manifest.cache + "\n/static/lib/chocodown.js\n/static/lib/coffeekup.js\n/static/lib/chocokup.js\n" + ((ref = (ref1 = this.options) != null ? ref1.script : void 0) != null ? ref : '') + "\n" + ((ref2 = (ref3 = this.options) != null ? ref3.stylesheet : void 0) != null ? ref2 : '');
        to_cache_list = [];
        ref4 = to_cache.split('\n');
        for (j = 0, len = ref4.length; j < len; j++) {
          line = ref4[j];
          to_cache_list.push((line.split('?'))[0].replace('/-', ''));
        }
        time_stamps_list = [];
        for (l = 0, len1 = to_cache_list.length; l < len1; l++) {
          filename = to_cache_list[l];
          try {
            pathname = require.resolve('/' + __.sysdir + filename);
            stats = Fs.statSync(pathname);
            time_stamps_list.push('#' + filename + ' : ' + stats.mtime.getTime());
          } catch (_error) {}
        }
        time_stamps = time_stamps_list.join('\n');
        return "CACHE MANIFEST\n# v1.00.000\n# Actor Version:" + (((ref5 = this.options) != null ? ref5.filename : void 0) != null ? (Fs.statSync(this.options.filename)).mtime.getTime() : -1) + "\n#\n# Files Timestamp\n#\n" + time_stamps + "\n    \nCACHE:\n" + to_cache + "\n\nFALLBACK:\nfavicon.ico /\n    \nNETWORK:\n/~";
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
