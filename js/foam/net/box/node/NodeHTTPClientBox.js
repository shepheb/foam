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
  name: 'NodeHTTPClientBox',
  extends: 'foam.net.box.Box',
  requires: [
    'foam.net.box.BoxMsg'
  ],
  documentation: 'A Node.js box that sends and receives HTTP messages using "http.request".',
  properties: [
    {
      name: 'url',
      required: true,
      help: 'The base URL for requests. The message\'s subBox is appended before sending.'
    }
  ],

  methods: [
    function put(msg) {
      msg = msg.clone();
      var target = require('url').parse(this.url + msg.subBox);
      msg.subBox = '';
      var raw = JSONUtil.compact.stringify(msg);
      target.method = 'POST';
      var self = this;
      var req = require('http').request(target, function(res) {
        res.setEncoding('utf-8');
        var data = [];
        res.on('data', function(chunk) { data.push(chunk); });
        res.on('end', function() {
          // Try to parse the JSON response.
          var raw = data.join('');
          var reply = JSONUtil.parse(self.X, raw);
          console.log('reply', reply);
          if ( self.BoxMsg.isInstance(reply) ) {
            msg.replyBox.put(reply);
          }
        });
      });

      req.write(raw, 'utf-8');
      req.end();
    }
  ]
});
