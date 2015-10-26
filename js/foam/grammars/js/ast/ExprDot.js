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
  package: 'foam.grammars.js.ast',
  name: 'ExprDot',
  extends: 'foam.grammars.js.ast.Expr',
  documentation: 'Expr for a dot expression, eg. foo.bar. For foo[bar] ' +
      'see $$DOC{ref:"foam.grammars.js.ast.ExprIndex"}. Note that this is ' +
      'left-associative, meaning foo.bar.baz parses as (foo.bar).baz.',

  properties: [
    {
      name: 'target',
      required: true,
      documentation: 'The object being indexed on, eg. "foo" of "foo.bar".',
      type: 'foam.grammars.js.ast.Expr',
    },
    {
      name: 'selector',
      required: true,
      documentation: 'The string after the dot, eg. "bar" of "foo.bar".',
      type: 'String',
    },
  ]
});
