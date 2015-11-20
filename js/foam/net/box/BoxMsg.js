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
  name: 'BoxMsg',
  package: 'foam.net.box',
  documentation: 'The payload put into a $$DOC{ref:"foam.net.box.Box"}. Carries optional $$DOC{ref:".body"}, $$DOC{ref:".subBox"} routing information, and $$DOC{ref:".attrs", text: "attributes"}. Requires a $$DOC{ref:".replyBox"}, but defaults to a $$DOC{ref:"foam.net.box.NullBox"}.',
  requires: [
    'foam.net.box.NullBox'
  ],
  properties: [
    {
      name: 'body',
      required: false,
      documentation: 'The body of the message. Must be serializable by $$DOC{ref:"JSONUtil"}. May be modelled, but need not be.'
    },
    {
      name: 'subBox',
      required: false,
      documentation: 'Optional. Contains additional routing information, if required.',
      defaultValue: ''
    },
    {
      name: 'replyBox',
      required: true,
      help: 'Destination for replies. Required, but defaults to a newly created $$DOC{ref:"NullBox"}.',
      factory: function() { return this.NullBox.create(); }
    },
    {
      name: 'attrs',
      required: false,
      help: 'Optional collection of extra attributes. Generally not set by the programmer directly, instead set by decorators to carry extra information like compression type.',
      factory: function() { return {}; }
    },
    {
      name: 'created',
      help: 'Creation timestamp. Beware clock skew after this has traveled between machines. Used by things like $$DOC{ref:"TTLBox"}.',
      factory: function() { return Date.now(); }
    }
  ]
});
