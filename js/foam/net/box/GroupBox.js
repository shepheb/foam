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
  package: 'foam.net.box',
  name: 'GroupBox',
  extends: 'foam.net.box.Box',
  requires: [
    'foam.net.box.Box',
    'foam.net.box.BoxMsg',
    'foam.net.box.RegisterMsg',
    'foam.net.box.UnregisterMsg'
  ],
  documentation: 'Abstract model holding a collection of Boxes with names. ' +
      'These names could be, but need not be, fully-qualified $$DOC{ref:"foam.net.box.DeliveryService"} names. ' +
      'put() is abstract; its behavior is determined by submodels. ' +
      'Submodels should call maybeHandleMessage() from put(), and return if it returns ' +
      'true. That indicates that the message was to (un)register, and it has been handled.',
  properties: [
    {
      name: 'delegates',
      hidden: true,
      transient: true,
      factory: function() { return {}; }
    }
  ],

  methods: [
    function register(name, box) {
      this.delegates[name] = box;
    },
    function unregister(name) {
      delete this.delegates[name];
    },

    // Should be called by submodel put()s, to check for RegisterMsg and UnregisterMsg.
    function maybeHandleMessage(msg) {
      var hit = false;
      if ( this.RegisterMsg.isInstance(msg) ) {
        this.register(msg.subBox, msg.body);
      } else if ( this.UnregisterMsg.isInstance(msg) ) {
        this.unregister(msg.body);
      }

      if ( hit )
        msg.replyBox.put(this.BoxMsg.create({ body: 'ok' }));
      return hit;
    },

    function put(msg) {
      console.error('Abstract method violation: put() called on GroupBox.');
    }
  ]
});
