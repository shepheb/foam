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
  name: 'StmtIf',
  extends: 'foam.grammars.js.ast.Stmt',
  properties: [
    {
      name: 'condition',
      required: true,
      documentation: 'Expr for the condition.',
      type: 'foam.grammars.js.ast.Expr',
    },
    {
      model_: 'ArrayProperty',
      name: 'ifBlock',
      required: true,
      documentation: 'The block of statements for the true case.',
      subType: 'foam.grammars.js.ast.Stmt',
    },
    {
      model_: 'ArrayProperty',
      name: 'elseBlock',
      documentation: 'The block of statements for the else case, if any.',
      subType: 'foam.grammars.js.ast.Stmt',
    },
    {
      model_: 'ArrayProperty',
      name: 'elseifs',
      documentation: 'An array of StmtIf objects for elseifs, if any.',
      subType: 'foam.grammars.js.ast.StmtIf',
    },
  ]
});
