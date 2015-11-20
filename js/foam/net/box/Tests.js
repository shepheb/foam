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
  name: 'Tests',
  requires: [
    'foam.net.box.BoxMsg',
    'foam.net.box.CallbackBox',
    'foam.net.box.DeliveryService',
    'foam.net.box.FutureBox',
    'foam.net.box.NullBox',
    'foam.net.box.SubBox',
  ],

  imports: [
    'assert',
    'fail',
    'log',
  ],

  tests: [
    {
      name: 'testCallbackBox',
      async: true,
      code: function(ret) {
        var msg = this.BoxMsg.create({
          body: 'something'
        });
        var cb = this.CallbackBox.create({
          callback: function(msg_) {
            this.assert(msg === msg_, 'Messages must match');
            ret();
          }.bind(this)
        });

        cb.put(msg);
      }
    },
    {
      name: 'testLookup',
      async: true,
      code: function(ret) {
        var ds = this.DeliveryService.create();
        var box = this.NullBox.create();
        ds.register('/abc', box);
        ds.lookup('/abc', function(b) {
          this.assert(box === b, 'Boxes must match');
          ret();
        }.bind(this));
      }
    },
    {
      name: 'testSend',
      async: true,
      code: function(ret) {
        var ds = this.DeliveryService.create();
        var msg = this.BoxMsg.create({
          body: 'something',
        });
        var box = this.CallbackBox.create({
          callback: function(m) {
            this.assert(msg === m, 'Messages must match');
            ret();
          }.bind(this)
        });

        ds.register('/abc', box);
        ds.send('/abc', msg);
      }
    },
    {
      name: 'testSendWithParent',
      async: true,
      code: function(ret) {
        var ds = this.DeliveryService.create();
        var msg = this.BoxMsg.create({
          body: 'something',
        });
        var box = this.CallbackBox.create({
          callback: function(m) {
            this.assert(msg.body === m.body, 'Bodies must match');
            this.assert(m.subBox === '/def', 'SubBox must be added');
            ret();
          }.bind(this)
        });

        ds.register('/abc', box);
        ds.send('/abc/def', msg);
      }
    },
    {
      name: 'testSendWithGrandparent',
      async: true,
      code: function(ret) {
        var ds = this.DeliveryService.create();
        var msg = this.BoxMsg.create({
          body: 'something',
        });
        var box = this.CallbackBox.create({
          callback: function(m) {
            this.assert(msg.body === m.body, 'Bodies must match');
            this.assert(m.subBox === '/def/ghi', 'SubBox must be added');
            ret();
          }.bind(this)
        });

        ds.register('/abc', box);
        ds.send('/abc/def/ghi', msg);
      }
    },
    {
      name: 'testLookupFutureBox',
      async: true,
      code: function(ret) {
        var ds = this.DeliveryService.create();
        var msg1 = this.BoxMsg.create({ body: 'thing1' });
        var msg2 = this.BoxMsg.create({ body: 'thing2' });

        var fut1 = afuture();
        var fut2 = afuture();

        var box = this.CallbackBox.create({
          callback: function(m) {
            this.assert(m.subBox, 'SubBox must be set');
            this.assert(m.body === (m.subBox === '/def' ? 'thing1' : 'thing2'),
                'Body must match by subBox');
            m.subBox === '/def' ? fut1.set(true) : fut2.set(true);
          }.bind(this)
        });

        ds.register('/abc', box);
        var defFut = afuture();
        var ghiFut = afuture();

        apar(defFut.get, ghiFut.get, fut1.get, fut2.get)(function(defBox, ghiBox) {
          this.assert(defBox !== ghiBox, 'Requests for different subBoxes should get different FutureBoxes');
          this.assert(defBox.delegate.delegate === ghiBox.delegate.delegate, 'But their inner boxes should match');
          this.assert(defBox.delegate.delegate === box, 'And they should be the /abc box.');
          ret();
        }.bind(this));

        ds.lookup('/abc/def', function(b) {
          this.assert(this.FutureBox.isInstance(b), 'lookup() returns FutureBoxes');
          defFut.set(b);
          b.put(msg1);
        }.bind(this));

        ds.lookup('/abc/ghi', function(b) {
          this.assert(this.FutureBox.isInstance(b), 'lookup() returns FutureBoxes');
          ghiFut.set(b);
          b.put(msg2);
        }.bind(this));
      }
    },
  ]
});
