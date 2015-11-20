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
  name: 'OneTimeFutureBox',
  extends: 'foam.net.box.Box',
  documentation: 'This is similiar to a $$DOC{ref:"foam.net.box.FutureBox"}: It queues requests until there is a delegate, or sends them immediately if there is a delegate. The difference is that after any put() to the delegate, the delegate is cleared. Only the first message from the queue is sent each time the delegate is set.',
  properties: [
    {
      name: 'delegate',
      type: 'Box',
      postSet: function(old, nu) {
        if ( nu && this.queue.length ) {
          var msg = this.queue.shift();
          console.log('OTFB dequeued', msg);
          nu.put(msg);
          this.delegate = '';
        }
      }
    },
    {
      name: 'queue',
      factory: function() { return []; }
    }
  ],

  methods: {
    put: function(msg) {
      if ( this.delegate && ! this.queue.length ) {
        console.log('OTFB immediate', msg);
        this.delegate.put(msg);
        this.delegate = '';
      } else {
        console.log('OTFB queued', msg);
        this.queue.push(msg);
      }
    }
  }
});
