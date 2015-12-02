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
  package: 'foam.u2',
  name: 'PropertyView',

  extends: 'foam.u2.Element',

  requires: [
    'Property',
    'foam.u2.Input'
  ],

  imports: [
    'data'
  ],

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        this.bindData_(old, nu);
      },
    },
    {
      name: 'prop'
    },
    {
      name: 'view',
      attribute: true,
      adapt: function(old, nu) {
        if (typeof nu === 'string') {
          var m = this.X.lookup(nu);
          if (m) return m.create();
        } else if (typeof nu === 'function') {
          return nu(this.Y);
        } else {
          return nu;
        }
      },
    },
    {
      name: 'child_',
    },
    [ 'nodeName', 'tr' ]
  ],

  methods: [
    function initE() {
      var view = this.view || this.prop.toPropertyE();
      var prop = this.prop;

      // TODO: remove check once all views extend View
      view.fromProperty && view.fromProperty(prop);

      this.child_ = view;
      this.cls(this.myCls()).add(this.child_);
      this.bindData_(null, this.data);
    },
    // Set properties on delegate view instead of this
    function attrs(map) {
      var model = this.view.model_;

      for ( var key in map ) {
        var value = map[key];
        var prop  = model.getProperty(key);

        if ( prop && prop.attribute ) {
          // Should we support value$ binding?
          this.view[key] = value;
        } else {
          if ( typeof value === 'function' )
            this.dynamicAttr_(key, value);
          else if ( Value.isInstance(value) )
            this.valueAttr_(key, value);
          else
            this.setAttribute(key, value);
        }
      }
      return this;
    }
  ],

  listeners: [
    function bindData_(old, nu) {
      if ( ! this.child_ ) return;
      if ( old ) Events.unlink(old.propertyValue(this.prop.name), this.child_.data$);
      if ( nu  ) Events.link(nu.propertyValue(this.prop.name), this.child_.data$);
    }
  ]
});
