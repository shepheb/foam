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
    'foam.ui.md.SharedStyles',
  ],

  properties: [
  ],

  methods: [
    function init() {
      this.SharedStyles.create();
      this.SUPER();
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
            First code sample block goes here.
          </div>
          <div class="md-card site-sample">
            Another code sample block goes here.
          </div>
        </div>
      </div>
    */},
  ]
});
