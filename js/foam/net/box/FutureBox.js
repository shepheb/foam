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
  name: 'FutureBox',
  extends: 'foam.net.box.Box',
  documentation: 'Queues all messages until its $$DOC{ref:".delegate"} is set. Once the delegate is set, messages are forwarded immediately.',
  properties: [
    {
      name: 'queue',
      hidden: true,
      factory: function() { return []; }
    },
    {
      name: 'delegate',
      help: 'The inner Box to forward to. Queues messages until the delegate is set, then forwards immediately in the future.',
      postSet: function(old, nu) {
        if ( nu ) {
          this.queue.forEach(function(msg) { nu.put(msg); });
          this.queue = [];
        }
      }
    }
  ],

  methods: [
    function put(msg) {
      if ( this.delegate ) this.delegate.put(msg);
      else this.queue.push(msg);
    }
  ]
});
