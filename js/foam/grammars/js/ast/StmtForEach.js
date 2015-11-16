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
  name: 'StmtForEach',
  extends: 'foam.grammars.js.ast.Stmt',
  properties: [
    {
      name: 'variable',
      documentation: 'Variable holding the current value inside the loop.',
      type: 'foam.grammars.js.ast.Expr',
    },
    {
      name: 'target',
      documentation: 'Object being iterated over.',
      type: 'foam.grammars.js.ast.Expr',
    },
    {
      name: 'iterationType',
      documentation: 'Either "in" or "of", determines whether we\'re ' +
          'iterating over keys (in) or values (of).',
      type: 'String',
    },
    {
      name: 'body',
      documentation: 'Body of the loop, a Statement or array of Statements.',
    },
  ]
});
