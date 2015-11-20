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
  package: 'foam.demos.box.chat',
  name: 'Server',
  documentation: 'Creates a NodeBoxServer with two kinds of messages: long polling receivers ' +
      'and incoming chat messages. Expects to have a fresh deliveryService in its context, ' +
      'but will create one if necessary.',

  requires: [
    'foam.net.box.AndBox',
    'foam.net.box.CallbackBox',
    'foam.net.box.DeliveryService',
    'foam.net.box.MapBox',
    'foam.net.box.OneTimeFutureBox',
    'foam.net.box.RegisterMsg',
    'foam.net.box.SubBox',
    'foam.net.box.node.NodeBoxServer',
  ],
  exports: [
    'deliveryService',
  ],
  properties: [
    {
      name: 'server',
      hidden: true,
      transient: true,
      help: 'NodeBoxServer for the chat server.',
      factory: function() { return this.NodeBoxServer.create({ port: 9999 }); }
    },
    {
      name: 'deliveryService',
      factory: function() {
        return this.DeliveryService.create();
      }
    },
    {
      name: 'broadcaster',
      factory: function() {
        return this.AndBox.create({ singleReply: true });
      }
    },
  ],

  listeners: [
    function massageSentMessage(msg) {
      msg.body = msg.subBox + ': ' + msg.body;
      msg.subBox = '';
      return msg;
    },
    function onNewClient(msg) {
      // First, create a new OneTimeFutureBox for long-polling responses.
      console.log('new client', msg);
      var longPoller = this.OneTimeFutureBox.create();

      // And register the polling box for setting its delegate.
      this.deliveryService.register(
          '/chat/poll' + msg.subBox,
          this.CallbackBox.create({
            callback: function(msg) {
              longPoller.delegate = msg.replyBox;
            }
          })
      );

      // Finally, register this new client with the broadcaster.
      this.broadcaster.put(this.RegisterMsg.create({
        subBox: msg.subBox, // user name
        body: longPoller
      }));
    }
  ],

  methods: [
    // TODO(braden): Make this into an "agent" that can run in a Node server.
    function execute() {
      this.deliveryService.register('/chat/broadcast', this.broadcaster);

      this.deliveryService.register('/chat/msg', this.MapBox.create({
        f: this.massageSentMessage,
        delegate: this.broadcaster
      }));

      this.deliveryService.register('/chat/new', this.CallbackBox.create({
        callback: this.onNewClient,
      }));
    }
  ]
});
