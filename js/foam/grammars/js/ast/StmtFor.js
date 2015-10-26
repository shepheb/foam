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
  name: 'StmtFor',
  extends: 'foam.grammars.js.ast.Stmt',
  properties: [
    {
      name: 'initializer',
      documentation: 'First part of the loop header. Usually a variable ' +
          'declaration, but not necessarily.',
      type: 'foam.grammars.js.ast.Stmt',
    },
    {
      name: 'condition',
      documentation: 'Condition under which the loop should continue. Can be ' +
          'empty, in which case the loop continues unbroken.',
      type: 'foam.grammars.js.ast.Expr',
    },
    {
      name: 'increment',
      documentation: 'Final part of the loop header. Usually i++ or similar. ' +
          'Formally a Stmt that runs after each iteration.',
      type: 'foam.grammars.js.ast.Stmt',
    },
    {
      model_: 'ArrayProperty',
      name: 'block',
      documentation: 'Body of the loop, an array of Stmts.',
      subType: 'foam.grammars.js.ast.Stmt',
    },
  ]
});
