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
  name: 'NamedBox',
  extends: 'foam.net.box.Box',
  imports: [
    'deliveryService'
  ],

  documentation: 'Forwards incoming messages to the Box registered under the given name. Requires this.deliveryService to be set. CACHES THE RETURNED BOX on the first put()!',

  properties: [
    {
      name: 'name',
      required: true,
      help: 'The address this NamedBox should forward messages to.'
    },
    {
      name: 'delegate',
      help: 'The delegate $$DOC{ref:"foam.net.box.Box"}. Once set, uses that cached Box rather than repeatedly look it up.'
    }
  ],

  methods: [
    function put(msg) {
      if ( this.delegate ) this.delegate.put(msg);
      else this.deliveryService.lookup(this.name, function(box) {
        this.delegate = box;
        this.delegate.put(msg);
      }.bind(this));
    }
  ]
});
