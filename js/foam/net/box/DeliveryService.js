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
// The flow:
// A lookup() call comes in. Check if it's cached, send if so. Otherwise, we send
// a LookupMsg to this.
// That does the same: if cached, send to it.
// If not cached, and there's a path to be split apart, do so. eg /a/b -> /a
// - Create a /a/b cache entry whose body is a FutureBox.
// - Send a lookup message for /a.
//   - On response, set the above FutureBox's delegate to the reply payload (/a)
//     augmented with a SubBox that decorates the BoxMsg.subBox with '/b'.
CLASS({
  package: 'foam.net.box',
  name: 'DeliveryService',
  documentation: 'Service responsible for name resolution. Generally one is installed in the context.',
  requires: [
    'foam.net.box.CallbackBox',
    'foam.net.box.FutureBox',
    'foam.net.box.NamedBox',
    'foam.net.box.SubBox',
  ],
  imports: [
    'setTimeout',
  ],
  properties: [
    {
      name: 'registry_',
      factory: function() { return {}; },
      documentation: 'Contains the registered delegate boxes.'
    }
  ],

  methods: [
    // Does not object if that topic was already registered.
    // TODO: Multiplex instead of replacing?
    function register(name, box) {
      this.registry_[name] = box;
    },
    function unregister(name) {
      delete this.registry_[name];
    },
    function put(msg) {
      // First, check if the target box is cached.
      var retBox;
      //console.log('LM', msg.body);
      if (this.registry_[msg.body]) {
        //console.log('    cached');
        retBox = this.registry_[msg.body];
      } else {
        // Otherwise, the tricky part.
        // Split apart the address.
        var lastSlash = msg.body.lastIndexOf('/');
        if ( lastSlash <= 0 ) {
          // TODO(braden): How does the root lookup work?
          console.error('Lookup failure! Could not look up root. Handle me somehow.');
          return;
        }

        // Create a FutureBox and cache it.
        retBox = this.registry_[msg.body] = this.FutureBox.create();

        var newAddr = msg.body.substring(0, lastSlash);
        var newSubBox = msg.body.substring(lastSlash);
        var newLookup = this.LookupMsg.create({
          body: newAddr,
          replyBox: this.CallbackBox.create({
            callback: function(lsm) {
              //console.log('parent lookup resolved: ' + newAddr + ' + ' + newSubBox);
              retBox.delegate = this.SubBox.create({
                delegate: lsm.body,
                subBox: newSubBox
              });
            }.bind(this)
          })
        });

        //console.log('    higher-level: ' + newAddr + ' + ' + newSubBox);

        // Asynchronously send this lookup.
        this.setTimeout(function() { this.put(newLookup); }.bind(this), 0);
      }

      // Either way, we have a reply for the caller.
      msg.replyBox.put(this.LookupSuccessMsg.create({
        body: retBox
      }));
    },

    // Looks up an address and calls the callback with the returned Box.
    function lookup(address, callback) {
      if ( this.registry_[address] ) {
        //console.log('lookup for ' + address + '; cached.');
        var found = this.registry_[address];
        this.setTimeout(function() { callback(found); }, 0);
      } else {
        // Send myself a LookupMsg for this address.
        //console.log('lookup for ' + address + '; not cached, sending message');
        var lm = this.LookupMsg.create({
          body: address,
          replyBox: this.CallbackBox.create({
            callback: function(lsm) {
              // The returned LookupSuccessMsg has a NamedBox in its body.
              // That box's delegate is the one we need.
              //console.log('lookup for ' + address + ' complete');
              callback(lsm.body);
            }
          })
        });
        this.put(lm);
      }
    },

    // Sends the given message to the Box registered at the given address.
    // No caching! Consider using a NamedBox instead; it will cache the Box
    // for repeated requests.
    function send(address, msg) {
      this.lookup(address, function(box) { box.put(msg); });
    }
  ],

  models: [
    {
      name: 'LookupMsg',
      extends: 'foam.net.box.BoxMsg',
      documentation: 'Custom type of message used internally by the $$DOC{ref:"DeliveryService"}.'
    },
    {
      name: 'LookupSuccessMsg',
      extends: 'foam.net.box.BoxMsg',
      documentation: 'Custom type of message used internally by the $$DOC{ref:"DeliveryService"}.'
    }
  ]
});
