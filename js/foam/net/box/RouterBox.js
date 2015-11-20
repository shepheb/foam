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
  name: 'RouterBox',
  extends: 'foam.net.box.GroupBox',
  requires: [
    'foam.net.box.Box',
    'foam.net.box.GroupBox'
  ],
  documentation: 'A $$DOC{ref:"foam.net.box.GroupBox"} that forwards each message based on the (first component of the) $$DOC{ref:"foam.net.box.BoxMsg.subBox"}. ' +
      'This expects a subBox like "/foo/bar", and finds the child named "foo" and forwards ' +
      'the message with its subBox set to "/bar". ' +
      'If subBox is empty, or "/", forwards to the child named "/" if it exists. ' +
      'Drops the message otherwise. ' +
      'If the subBox is one-layer, like "/" or "/foo", the outgoing subBox will be "".',

  methods: [
    function put(msg) {
      if ( this.maybeHandleMessage(msg) ) return;

      if ( msg.subBox && msg.subBox !== '/' ) {
        // Forward to '/', if it exists.
        var root = this.delegates['/'];
        var c = msg.clone();
        c.subBox = '';
        root && root.put(c);
      } else {
        var nextSlash = msg.subBox.indexOf('/', 1);
        var route, rest;
        if ( nextSlash < 0 ) {
          route = msg.subBox.substring(1);
          rest  = '';
        } else {
          route = msg.subBox.substring(1, nextSlash);
          rest  = msg.subBox.substring(nextSlash);
        }

        var d = this.delegates[route];
        var c = msg.clone();
        c.subBox = rest;
        d && d.put(c);
      }
    }
  ]
});
