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
  package: 'foam.net.box.node',
  name: 'NodeBoxServer',
  requires: [
    'foam.net.box.BoxMsg',
    'foam.net.box.CallbackBox'
  ],
  imports: [
    'deliveryService'
  ],
  documentation: '(For Node.js servers) Creates an HTTP server on a given port. ' +
      'All incoming messages are stripped of the prefix, and forwarded to the $$DOC{ref:"foam.net.box.DeliveryService", text: "deliveryService"}. ' +
      'Each request has its $$DOC{ref:"foam.net.box.BoxMsg.replyBox"} set to one that responds via HTTP response; ' +
      'these must be called eventually to prevent dangling connections.',

  properties: [
    {
      name: 'prefix',
      help: 'Set this to have the server listen for only those requests whose path begins with this prefix. The prefix is stripped before making calls to the deliveryService.',
      defaultValue: ''
    },
    {
      name: 'server',
      help: 'If set at init-time, the given server will be used and this NodeBoxServer listens for all requests under the given prefix. If not set, a server will be created on the given port.',
      hidden: true,
      transient: true
    },
    {
      name: 'port',
      defaultValue: 80
    },
    {
      model_: 'foam.node.NodeRequireProperty',
      name: 'http',
    },
    {
      name: 'urlParser',
      factory: function() { return require('url'); },
      hidden: true,
      transient: true
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      if ( ! this.server ) {
        this.server = this.http.createServer();
        this.server.listen(this.port);
      }

      this.server.on('request', this.onRequest);
    }
  ],

  listeners: [
    {
      name: 'onRequest',
      code: function(req, res) {
        // Check for the prefix, and ignore the request if it's not there.
        var url = this.urlParser.parse(req.url);
        if ( ! url.path.startsWith(this.prefix) ) return;

        var self = this;
        var data = [];
        req.on('data', function(chunk) { data.push(chunk); });
        req.on('end', function() {
          var raw = data.join('');
          var msg = JSONUtil.parse(self.X, raw);
          if ( self.BoxMsg.isInstance(msg) ) {
            msg.replyBox = self.CallbackBox.create({
              callback: function(msg) {
                res.end(JSONUtil.compact.stringify(msg), 'utf-8');
              }
            });

            // Strip the prefix from the URL path.
            var address = this.prefix ?
                url.path.substring(this.prefix.length) : url.path;

            // And call into the deliveryService with that URL.
            console.log('MSG', address, msg);
            self.deliveryService.send(address, msg);
          }
        });
      }
    }
  ]
});
