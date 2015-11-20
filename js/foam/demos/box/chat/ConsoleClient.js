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
  name: 'ConsoleClient',
  requires: [
    'foam.net.box.BoxMsg',
    'foam.net.box.CallbackBox',
    'foam.net.box.LongPollingBoxServer',
    'foam.net.box.SubBox',
    'foam.net.box.node.NodeHTTPClientBox',
  ],

  properties: [
    {
      name: 'username',
    },
    {
      model_: 'foam.node.NodeRequireProperty',
      name: 'readline',
    },
  ],

  methods: [
    function execute() {
      var client = this.NodeHTTPClientBox.create({
        url: 'http://localhost:9999'
      });
      client.put(this.BoxMsg.create({
        subBox: '/chat/new/' + this.username
      }));

      var longPoller = this.LongPollingBoxServer.create({
        pollBox: this.SubBox.create({
          subBox: '/chat/poll/' + this.username,
          delegate: client
        }),
        delegate: this.CallbackBox.create({
          callback: function(msg) {
            if ( msg.subBox === '/msg' ) {
              console.log(msg.body);
            }
          }
        })
      });

      var rl = this.readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.setPrompt('> ', 2);
      rl.prompt();
      rl.on('line', function(line) {
        line = line.trim();
        client.put(this.BoxMsg.create({
          subBox: '/chat/msg/' + this.username,
          body: line
        }));
        rl.prompt();
      }.bind(this));

      rl.on('close', function() {
        process.exit(0);
      });
    },
  ]
});
