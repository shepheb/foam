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
  name: 'StmtTryCatch',
  extends: 'foam.grammars.js.ast.Stmt',
  properties: [
    {
      name: 'tryBlock',
      required: true,
      documentation: 'Statement for the try block.',
      type: 'foam.grammars.js.ast.Stmt',
    },
    {
      name: 'catchVariable',
      required: false,
      documentation: 'If a catch statement is provided, this is the ' +
          'identifier used for the exception.',
      type: 'String',
    },
    {
      name: 'catchBlock',
      required: false,
      documentation: 'The statements for the catch block, if any.',
    },
    {
      name: 'finallyBlock',
      documentation: 'Statement for the finally block, if any.',
      type: 'foam.grammars.js.ast.Stmt',
    },
  ]
});
