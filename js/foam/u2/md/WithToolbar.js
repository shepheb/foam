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
  package: 'foam.u2.md',
  name: 'WithToolbar',
  extends: 'foam.u2.Element',

  documentation: 'Creates a full-height container with a MD toolbar at the ' +
      'top and a scrolling body below. Calling $$DOC{ref:".add"} on this ' +
      'actually adds to the body.',

  requires: [
    'foam.u2.md.Toolbar',
    'foam.u2.md.ToolbarAction',
  ],

  imports: [
    'stack',
  ],

  properties: [
    {
      name: 'title',
    },
    {
      name: 'body_',
      documentation: 'The body element. add() calls are forwarded here.',
      factory: function() {
        return this.Y.E('div').cls(this.myCls('body'));
      }
    },
    {
      name: 'pendingChildren_',
      factory: function() {
        return [];
      }
    },
    {
      name: 'backAction_',
      factory: function() {
        return this.ToolbarAction.create({ data: this, action: this.BACK });
      }
    },
    {
      name: 'toolbar_',
      factory: function() {
        var t = this.Toolbar.create({ title$: this.title$ });
        t.addLeftActions([this.backAction_]);
        return t;
      }
    },
    ['addPassthrough_', false]
  ],

  actions: [
    {
      name: 'back',
      ligature: 'arrow_back',
      code: function() {
        this.stack.popView();
      }
    },
  ],

  methods: [
    function initE() {
      this.addPassthrough_ = true;
      this.cls(this.myCls()).add(this.toolbar_).add(this.body_);
      this.addPassthrough_ = false;
    },

    function add() {
      if (this.addPassthrough_) {
        return this.SUPER.apply(this, arguments);
      } else {
        this.body_.add.apply(this.body_, arguments);
        return this;
      }
    },
  ],

  templates: [
    function CSS() {/*
      $ {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
      }

      $-body {
        overflow-x: hidden;
        overflow-y: auto;
      }
    */},
  ]
});
