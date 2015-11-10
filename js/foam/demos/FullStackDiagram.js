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
  package: 'foam.demos',
  name: 'FullStackDiagram',
  extends: 'foam.graphics.CView',
  requires: [
    'foam.util.Timer',
    'foam.graphics.CView',
    'foam.graphics.LabelledBox',
  ],

  properties: [
    ['width', 1500],
    ['height', 600],
    ['background', 'white'],
    {
      name: 'timer',
      factory: function() {
        return this.Timer.create();
      }
    },
  ],

  methods: [
    function initCView() {
      var w = 120;
      var box = function(color, x, text) {
        return this.LabelledBox.create({color: 'white', width: w, height:100, font: 'bold 10pt Arial', y: -200, background: color, x: x, text: text});
      }.bind(this);

      var baseX = 0;
      var x = baseX;
      var sql         = box('green',  x+=w, 'Issue.sql');
      var jdbc        = box('red',    x+=w, 'IssueDB.java');
      var java        = box('red',    x+=w, 'Issue.java');
      var skeleton    = box('red',    x+=w, 'IssueSkeleton.java');
      var proto       = box('black',  x+=w, 'Issue.proto');
      var model       = box('black',  x,      'Issue.model');
      var stub        = box('blue',   x+=w, 'IssueStub.js');
      var js          = box('blue',   x+=w, 'Issue.js');
      var ui          = box('blue',   x+=w, 'Issue_UI.js');
      var ui_tm       = box('blue',   x,      'IssueColumns.js');
      var ui_table    = box('blue',   x,      'IssueTable.js');
      var ui_detail   = box('blue',   x,      'IssueDetail.js');
      var ui_ctrl     = box('blue',   x,      'IssueController.js');
      var ui_model    = box('blue',   x,      'IssueModel.js');
      var html        = box('orange', x+=w, 'Issue.html');
      var css         = box('pink',   x+=w, 'Issue.css');
      var middle      = box('black',  baseX + 4*w,    'Middleware');
      var dao         = box('blue',   baseX + 6*w,    'DAO');
      var search      = box('blue',   baseX + 6*w,    'Search');

      model.height *= 2;
      model.y -= 10;

      middle.y = 500;
      middle.width = 3*w;
      middle.height = 0;
      ui_tm.height = ui_table.height = ui_detail.height = ui_ctrl.height = ui_model.height = 80;

      var d = 10;
      this.addChildren(sql, jdbc, java, skeleton, proto, stub, js, ui, html,
          css, ui_tm, ui_table, ui_detail, ui_ctrl, ui_model, middle, model,
          dao, search);

      var M = Movement;
      var B = M.easeIn(0.2);

      M.compile([
        [1000, function() { sql.y = 400; }, B],
        [1000, function() { jdbc.y = java.y = skeleton.y = 400;   }, B],
        [1000, function() { proto.y = 400;   }, B],
        [1000, function() { stub.y = js.y = ui.y = 400;   }, B],
        [1000, function() { middle.height = 35;   }, B],
        [1000, function() { html.y = 400;   }, B],
        [1000, function() { css.y = 400;   }, B],
        [1000, function() { ui_tm.y = 0; ui_table.y = 80; ui_detail.y = 160; ui_ctrl.y = 240; ui_model.y = 320;  }, B],

        [0],
        [1000, function() { proto.y -= 100; }],
        [
          [1500, function() { proto.y = -200; }, M.easeOut(0.5)],
          [1500, function() { proto.x = -200; proto.a = -Math.PI*6; }, M.easeIn(0.5)]
        ],
        [500],
        [1000, function() { model.y = 300;   }, B],
        function() { middle.text = 'FOAM'; },
        [3000, function() { middle.width += 720; middle.x -= 360;   }, B],
        [0],
        [
          [1000, function() { stub.x += 120; ui.x += 120; js.x += 120; ui_tm.x += 120; ui_table.x += 120; ui_detail.x += 120; ui_ctrl.x += 120; ui_model.x += 120; html.x += 120; css.x += 120; middle.width += 120; }],
          [1000, function() { dao.y  = 400; search.y = 300;  }]
        ],
      ])();
    }
  ]
});
