/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CLASS({
  name: 'MultiDAO',
  package: 'foam.navigator.dao',
  extendsModel: 'AbstractDAO',

  requires: [
    'EasyDAO',
    'foam.navigator.BrowserConfig',
    'foam.navigator.dao.ModelIDDecoratorDAO',
    'foam.navigator.dao.IDConfig'
  ],

  imports: [
    'console'
  ],

  properties: [
    {
      name: 'models',
      model_: 'StringArrayProperty',
      factory: function() { return []; }
    },
    {
      name: 'configDAO',
      model_: 'DAOProperty',
      factory: function() {
        return this.EasyDAO.create({
          model: this.BrowserConfig,
          daoType: 'IDB',
          seqNo: true,
          cache: true
        });
      }
    },
    {
      name: 'daos',
      factory: function() { return {}; }
    },
    {
      name: 'idDecoratorConfig',
      factory: function() { return this.IDConfig.create(); }
    },
    {
      name: 'listeners_',
      model_: 'ArrayProperty',
      factory: function() { return []; }
    }
  ],

    methods: [
      {
        name: 'init',
        code: function() {
          this.SUPER();
          this.configDAO.pipe({
            put: function(config) {
              this.buildDAO(config);
            }.bind(this)
          });
        }
      },
      {
        name: 'put',
        code: function(obj, opt_sink) {
          var model = obj.model_;
          var name = model.package ?
              model.package + '.' + model.name : model.name;
          if ( ! this.daos[name] ) {
            var msg = 'Model: "' + name + '" unknown to MultiDAO';
            this.console.warn(msg);
            opt_sink && opt_sink.error(msg);
          } else {
            this.daos[name](function(dao) {
              dao.put(obj, opt_sink);
            });
          }
        }
      },
      {
        name: 'remove',
        code: function(id, opt_sink) {
          var modelName = this.idDecoratorConfig.getModelName(id);
          this.daos[modelName].aseq(function(ret, dao) {
            dao.remove(id, opt_sink);
            ret();
          });
        }
      },
      {
        name: 'removeAll',
        code: function(sink, options) {
          var proxySink = {
            remove: sink && sink.remove,
            error: sink && sink.error
          };
          var self = this;
          return apar.apply(null, this.models.map(function(modelName) {
            return self.daos[modelName].aseq(function(ret, dao) {
              dao.removeAll(proxySink, options)(ret);
            });
          })).aseq(function(ret) {
            sink && sink.eof && sink.eof();
            ret && ret(sink);
          });
        }
      },
      {
        name: 'find',
        code: function(id, sink) {
          var modelName = this.idDecoratorConfig.getModelName(id);
          if ( ! this.dao[modelName] ) {
            sink.error('Unknown model name prefix in ID: ' + id);
            return;
          }
          this.dao[modelName](function(dao) {
            dao.find(id, sink);
          });
        }
      },
      {
        name: 'select',
        todo: 'Need proper options support',
        code: function(sink, options) {
          var proxySink = {
            put: function(o) {
              sink && sink.put && sink.put(o);
            },
            error: function() {
              sink && sink.error && sink.error.apply(this, arguments);
            }
          };
          var self = this;
          return apar.apply(null, this.models.map(function(modelName) {
            return self.daos[modelName].aseq(function(ret, dao) {
              dao.select(proxySink, options)(ret);
            });
          })).aseq(function(ret) {
            sink && sink.eof && sink.eof();
            ret && ret.call(null, sink);
          });
        }
      },
      {
        name: 'update',
        code: function(expr) {
          throw 'update() not supported on MultiDAO (yet)';
        }
      },
      {
        name: 'listen',
        code: function(sink) {
          this.models.forEach(function(modelName) {
            this.daos[modelName](function(dao) {
              dao.listen(sink);
            });
          }.bind(this));
          this.listeners_.push(sink);
        }
      },
      {
        name: 'pipe',
        code: function(sink) {
          this.models.forEach(function(modelName) {
            this.daos[modelName](function(dao) { dao.pipe(sink); });
          }.bind(this));
        }
      },
      {
        name: 'unlisten',
        code: function(sink) {
          this.models.forEach(function(modelName) {
            this.daos[modelName](function(dao) {
              dao.unlisten(sink);
            });
          }.bind(this));
          this.listeners_ = this.listeners_.filter(function(listener) {
            return listener !== sink;
          }.bind(this));
        }
      },
      {
        name: 'limit',
        todo: 'This is an alright approximation, but we can probably do better',
        code: function(count) {
          this.models.forEach(function(modelName) {
            this.daos[modelName].limit(count);
          }.bind(this));
        }
      },
      {
        name: 'buildDAO',
        code: function(config) {
          var model = config.model;
          var modelName = model.package ?
              model.package + '.' + model.name : model.name;
          var decoratedConfigDAO = this.ModelIDDecoratorDAO.create({
            config: this.idDecoratorConfig,
            delegate: config.dao
          });
          this.addListenersToDAO(decoratedConfigDAO);
          this.daos[modelName] = decoratedConfigDAO;
          return decoratedConfigDAO;
        }
      },
      {
        name: 'addListenersToDAO',
        code: function(dao) {
          this.listeners_.forEach(function(listener) {
            dao.listen(listener);
          }.bind(this));
        }
      }
    ]
  });