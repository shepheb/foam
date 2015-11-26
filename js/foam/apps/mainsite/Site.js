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
  package: 'foam.apps.mainsite',
  name: 'Site',
  extends: 'foam.ui.View',
  requires: [
    'foam.flow.AceCodeView',
    'foam.flow.SourceCode',
    'foam.sandbox.IsolatedContext',
    'foam.ui.md.CitationView',
    'foam.ui.md.DetailView',
    'foam.ui.md.FlexTableView',
    'foam.ui.md.SharedStyles',
  ],

  properties: [
    {
      name: 'isolatedContext_',
      hidden: true,
      factory: function() {
        // IsolatedContext is a wrapper, we really want its Y.
        return this.IsolatedContext.create(null, GLOBAL.X).Y;
      }
    },
    {
      name: 'code1',
      factory: function() {
        return this.SourceCode.create({
          code: "CLASS({\n" +
              "  package: 'foam.sandbox',\n" +
              "  name: 'Person',\n" +
              "  properties: [\n" +
              "    {\n" +
              "      name: 'id',\n" +
              "      hidden: true,\n" +
              "    },\n" +
              "    'name',\n" +
              "    {\n" +
              "      type: 'Int',\n" +
              "      name: 'age'\n" +
              "    },\n" +
              "    {\n" +
              "      type: 'foam.core.types.StringEnum',\n" +
              "      name: 'sex',\n" +
              "      defaultValue: 'M',\n" +
              "      choices: [['M', 'Male'], ['F', 'Female']]\n" +
              "    }\n" +
              "  ]\n" +
              "});\n"
        });
      },
      postSet: function(old, nu) {
        this.runSample1();
      },
    },
    {
      name: 'editor1',
      factory: function() {
        return this.AceCodeView.create({
          data$: this.code1$,
          pathToAce: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.2/ace.js',
          //aceMode: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.2/mode-javascript.js',
          //aceTheme: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.2/theme-textmate.js',
          aceMinLines: 25,
        });
      }
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'features1',
      label: 'Choose a Feature',
      view: {
        factory_: 'foam.ui.md.PopupChoiceView',
        floatingLabel: true,
      },
      defaultValue: 'DetailView',
      choices: [
        ['DetailView', 'Detail view'],
        ['CitationView', 'Summary view'],
        ['Table', 'Table view'],
      ],
      postSet: function(old, nu) {
        this.runSample1();
      },
    },
    {
      name: '$output1',
      getter: function() {
        return this.X.$(this.id + '-output-1');
      }
    },
    {
      name: 'commentary1',
      documentation: 'Filled in when features1 is set.',
      mode: 'read-only',
    },
    {
      name: 'featureImplementations',
      documentation: 'A map for functions that return views as output.',
      factory: function() {
        var args = {
          name: 'John Smith',
          age: 30
        };
        return {
          DetailView: function(model) {
            return this.DetailView.create({ data: model.create(args) });
          },
          CitationView: function(model) {
            return this.CitationView.create({ data: model.create(args) });
          },
          Table: function(model) {
            return this.FlexTableView.create({
              model: model,
              data: [model.create(args)],
            });
          }
        };
      }
    },
    {
      name: 'commentary',
      factory: function() {
        return {
          DetailView: 'FOAM can generate default views from a model. They can easily be customized, or replaced altogether.',
          CitationView: 'FOAM can make a reasonable guess at a summary for a model - in this case the "name" property is chosen.',
        };
      }
    },
  ],

  methods: [
    function init() {
      this.SharedStyles.create();
      this.SUPER();
    },
    function initHTML() {
      this.SUPER();
      this.runSample1();
    },
  ],

  listeners: [
    {
      name: 'runSample1',
      isMerged: 250,
      code: function() {
        if (!this.$output1) return;
        var target = this.featureImplementations[this.features1];
        if (!target) {
          this.$output1.innerHTML = 'Select a feature';
          this.commentary1 = '';
        } else {
          var str = this.code1.code;
          var model;
          var X = this.isolatedContext_;
          try {
            model = eval('(function(X, CLASS){' + str + '; return X.__model;}).call(null, X, function(h, x) { X.__model = X.CLASS(h, x); })');
          } catch (e) {
            this.$output1.innerHTML = 'Error loading model: ' + e;
            return;
          }

          try {
            var v = target.call(this, model);
            this.$output1.innerHTML = v.toHTML();
            v.initHTML();
            this.commentary1 = this.commentary[this.features1];
          } catch (e) {
            this.$output1.innerHTML = 'Error rendering view: ' + e;
            return;
          }
        }
      }
    },
  ],

  templates: [
    function CSS() {/*
      .site-body {
        font-size: 16px;
        margin: 0;
        padding: 0;
      }
      .site-hero {
        align-items: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 100px 0;
      }
      .site-hero h1 {
        font-size: 112px;
        font-weight: 300;
      }
      .site-hero h3 {
        font-size: 45px;
        font-weight: normal;
      }

      .site-punch {
        background-color: #111;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
      }
      .site-punch-item {
        color: #fff;
        font-size: 16px;
        margin: 16px;
        width: 300px;
      }
      .site-punch-item h3 {
        font-weight: normal;
        font-size: 24px;
        margin-top: 0;
      }
      .site-punch-item a {
        color: #7baaf7;
      }

      .site-prose ul {
        margin: 8px 0;
      }

      .site-background {
        background-color: #e0e0e0;
        display: flex;
        flex-direction: column;
        padding: 8px;
      }

      .site-sample {
        height: 700px;
      }
      .site-sample-bottom {
        display: flex;
      }
      .site-sample-side {
        width: 40%;
      }
      .site-sample-output {
        width: 60%;
      }
      .site-sample-commentary {
        margin: 16px;
      }

      @media (max-width: 900px) {
        .site-background {
          align-items: stretch;
        }
      }

      @media (min-width: 900px) {
        .site-background {
          align-items: center;
        }
        .site-background .md-card {
          width: 860px;
        }
      }
    */},
    function toHTML() {/*
      <div id="%%id" class="site-body">
        <div class="site-hero">
          <h1>FOAM</h1>
          <h3>Fast apps fast</h3>
        </div>
        <div class="site-punch">
          <div class="site-punch-item">
            <h3>High-level</h3>
            <p>You write very high-level, declarative <em>models</em>, and FOAM
            builds many features from them: default views, storage,
            serialization, Java and Swift classes, and much more.</p>
          </div>
          <div class="site-punch-item">
            <h3>Compact</h3>
            <p>Your app and FOAM itself are both modeled, keeping your payload small.</p>
            <p>Our <a href="https://foam-framework.github.io/foam/apps/gmail/main.html">Gmail</a> app is 150KB unzipped.</p>
            <p>With so little code to write, FOAM is perfect for rapid app development.</p>
          </div>
          <div class="site-punch-item">
            <h3>Fast</h3>
            <p>FOAM apps are small and load fast &mdash;<br/>even on mobile.</p>
            <p>FOAM's reactive programming is efficient, and fast enough for
            animation &mdash;<br/>even on mobile.</p>
          </div>
        </div>
        <div class="site-background">
          <div class="md-card site-prose">
            <p>FOAM is an open-source modeling framework developed at Google.</p>
            <p>With FOAM, you create a <em>model</em>, and FOAM can support many
            features based on it:</p>
            <ul>
              <li>A (Javascript, Java or Swift) class, with <tt>diff()</tt>, <tt>clone()</tt>, etc.</li>
              <li>Serialization to and from JSON, XML and <a href="https://developers.google.com/protocol-buffers/?hl=en">protocol buffers</a>.</li>
              <li>Storage in many places, from IndexedDB to MongoDB.</li>
              <li>Query parsers and a query optimizer.</li>
              <li>Offline syncing, and many flavours of caching.</li>
              <li>Customizable detail and summary views for HTML, Android and iOS.</li>
            </ul>
            <p>FOAM combines these features with reactive programming and MVC,
            forming a full-stack framework building modern, cross-platform apps.</p>
            <p>FOAM is in beta. It's production-ready but still under
            heavy development. Expect many new features &mdash; and bugs
            &mdash; as FOAM continues to evolve.</p>
          </div>
          <div class="md-card site-sample">
            <div class="site-sample-code">%%editor1</div>
            <div class="site-sample-bottom">
              <div class="site-sample-side">
                <div class="site-sample-features">$$features1</div>
                <div class="site-sample-commentary">$$commentary1</div>
              </div>
              <div id="<%= this.id %>-output-1" class="site-sample-output">
              </div>
            </div>
          </div>
        </div>
      </div>
    */},
  ]
});
