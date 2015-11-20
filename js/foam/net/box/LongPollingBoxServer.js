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
  name: 'LongPollingBoxServer',
  requires: [
    'foam.net.box.Box',
    'foam.net.box.CallbackBox',
    'foam.net.box.BoxMsg'
  ],
  documentation: 'Uses the provided $$DOC{ref:".pollBox"} to long-poll a server. The outgoing messages to the server have empty $$DOC{ref:"foam.net.box.BoxMsg.body", text:"bodies"}. Long polls a server with empty messages over a Box, and delegates incoming messages to another Box.',
  properties: [
    {
      name: 'pollBox',
      type: 'Box',
      documentation: 'The $$DOC{ref:"foam.net.box.Box"} for hitting the long polling endpoint.',
      required: true
    },
    {
      name: 'delegate',
      type: 'Box',
      documentation: 'Box which incoming messages should be sent to.',
      required: true
    },
    {
      name: 'callbackBox',
      type: 'Box',
      documentation: 'CallbackBox that fires when replies come back from the polling box.',
      hidden: true,
      transient: true,
      factory: function() {
        return this.CallbackBox.create({
          callback: this.callback
        });
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.longPoll();
    }
  ],

  listeners: [
    {
      name: 'longPoll',
      code: function() {
        this.pollBox.put(this.BoxMsg.create({
          replyBox: this.callbackBox
        }));
      }
    },
    {
      name: 'callback',
      code: function(msg) {
        if ( this.delegate ) this.delegate.put(msg);
        this.longPoll();
      }
    }
  ]
});
