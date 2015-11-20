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
  name: 'MapBox',
  extends: 'foam.net.box.Box',
  documentation: 'Delegate Box that runs a clone of the message through a function and forwards the result.',
  properties: [
    {
      name: 'f',
      defaultValue: function(msg) { return msg; },
      help: 'The function to apply to a clone of the message. Defaults to identity function.'
    },
    {
      name: 'delegate'
    }
  ],

  methods: [
    function put(msg) {
      console.log('MAPBOX');
      this.delegate && this.delegate.put(this.f(msg.clone()));
    }
  ]
});
