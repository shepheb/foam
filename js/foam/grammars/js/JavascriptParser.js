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
  package: 'foam.grammars.js',
  name: 'JavascriptParser',
  requires: [
    'foam.grammars.ExprGrammar',
    'foam.grammars.js.ast.Expr',
    'foam.grammars.js.ast.ExprArrayLiteral',
    'foam.grammars.js.ast.ExprAssignment',
    'foam.grammars.js.ast.ExprBinOp',
    'foam.grammars.js.ast.ExprCall',
    'foam.grammars.js.ast.ExprDot',
    'foam.grammars.js.ast.ExprIndex',
    'foam.grammars.js.ast.ExprNew',
    'foam.grammars.js.ast.ExprNumericLiteral',
    'foam.grammars.js.ast.ExprObjectLiteral',
    'foam.grammars.js.ast.ExprPrefix',
    'foam.grammars.js.ast.ExprPostfix',
    'foam.grammars.js.ast.ExprStringLiteral',
    'foam.grammars.js.ast.ExprVar',
    'foam.grammars.js.ast.Stmt',
    'foam.grammars.js.ast.StmtExpr',
    'foam.grammars.js.ast.StmtFor',
    'foam.grammars.js.ast.StmtIf',
    'foam.grammars.js.ast.StmtWhile',
    'foam.grammars.js.ast.VarDecl',
  ],

  properties: [
    {
      name: 'parser',
      factory: function() {
        var self = this;
        var postfix = function(arg, op) {
          return self.ExprPostfix.create({ op: op, expr: arg });
        };
        var prefix = function(op, arg) {
          return self.ExprPrefix.create({ op: op, expr: arg });
        };
        var infix = function(l, op, r) {
          return self.ExprBinOp.create({ op: op, lhs: l, rhs: r });
        };
        var asst = function(l, op, r) {
          return self.ExprAssignment.create({ op: op, lhs: l, rhs: r });
        };

        // Extends a parser to look ahead and ensure the next character is a
        // non-identifier. Whitespace, brackets, etc. are fine.
        var gapAfter = function(p) {
          var p2 = seq1(0, p, lookahead(not(sym('alphaNum'))));
          p2.toString = function() { return p; };
          return p2;
        };

        // Takes four parsers: left, sep, right, element.
        // eg. [ , ] expr for [array, literals].
        // The resulting parser returns an array of element's results.
        // Whitespace is ignored in between the parts.
        // 0 elements is allowed.
        var bracketed = function(l, s, r, e) {
          return seq1(1, l,
            repeat(
              seq1(1, sym('ws'), e),
              seq(sym('ws'), s)),
            sym('ws'), r);
        };
        var eg = this.ExprGrammar.create();
        var exprGrammar = eg.build({
          symbolName: 'expr',
          termName: 'term',
          skip: sym('ws'),
          // Tightest to loosest binding
          operations: [
            [ // Precedence 16, according to MDN.
              { type: 'postfix', op: '++', output: postfix },
              { type: 'postfix', op: '--', output: postfix },
            ], [ // Precedence 15 - prefixes and unary math
              { type: 'prefix', op: '!', output: prefix },
              { type: 'prefix', op: '~', output: prefix },
              { type: 'prefix', op: '++', output: prefix },
              { type: 'prefix', op: '--', output: prefix },
              { type: 'prefix', op: '+', output: prefix },
              { type: 'prefix', op: '-', output: prefix },
              { type: 'prefix', op: gapAfter('typeof'), output: prefix },
              { type: 'prefix', op: gapAfter('void'), output: prefix },
              { type: 'prefix', op: gapAfter('delete'), output: prefix },
            ], [ // Precedence 14 - multiplication ops
              { type: 'infixLeft',  op: '*', output: infix },
              { type: 'infixLeft',  op: '/', output: infix },
              { type: 'infixLeft',  op: '%', output: infix },
            ], [ // Precedence 13 - addition ops
              { type: 'infixLeft', op: '+', output: infix },
              { type: 'infixLeft', op: '-', output: infix },
            ], [ // Precedence 12 - bitwise ops
              { type: 'infixLeft', op: '<<',  output: infix },
              { type: 'infixLeft', op: '>>>', output: infix },
              { type: 'infixLeft', op: '>>',  output: infix },
            ], [ // Precedence 11 - inequalities and misc. comparsions
              { type: 'infixLeft', op: '<=', output: infix },
              { type: 'infixLeft', op: '>=', output: infix },
              { type: 'infixLeft', op: '<',  output: infix },
              { type: 'infixLeft', op: '>',  output: infix },
              { type: 'infixLeft', op: gapAfter('in'), output: infix },
              { type: 'infixLeft', op: gapAfter('instanceof'), output: infix },
            ], [ // Precedence 10 - equalities
              { type: 'infixLeft', op: '===', output: infix },
              { type: 'infixLeft', op: '!==', output: infix },
              { type: 'infixLeft', op: '==',  output: infix },
              { type: 'infixLeft', op: '!=',  output: infix },
            ],
            [{ type: 'infixLeft', op: '&',  output: infix }],
            [{ type: 'infixLeft', op: '^',  output: infix }],
            [{ type: 'infixLeft', op: '|',  output: infix }],
            [{ type: 'infixLeft', op: '&&', output: infix }],
            [{ type: 'infixLeft', op: '||', output: infix }],
            /*
            [
              {
                type: 'ternaryRight',
                left: '?',
                right: ':',
                output: function(left, opLeft, middle, opRight, right) {
                  return self.ExprTernary.create({
                    condition: left,
                    trueCase: middle,
                    falseCase: right
                  });
                }
              }
            ],
            */
            [ // Precedence 3 - assignment
              { type: 'infixRight', op:    '=', output: asst },
              { type: 'infixRight', op:   '+=', output: asst },
              { type: 'infixRight', op:   '-=', output: asst },
              { type: 'infixRight', op:  '**=', output: asst },
              { type: 'infixRight', op:   '*=', output: asst },
              { type: 'infixRight', op:   '/=', output: asst },
              { type: 'infixRight', op:   '%=', output: asst },
              { type: 'infixRight', op:  '<<=', output: asst },
              { type: 'infixRight', op:  '>>=', output: asst },
              { type: 'infixRight', op: '>>>=', output: asst },
              { type: 'infixRight', op:   '&=', output: asst },
              { type: 'infixRight', op:   '^=', output: asst },
              { type: 'infixRight', op:   '|=', output: asst },
            ]
          ]
        });


        var g = {
          __proto__: exprGrammar,
          START: sym('expr'),

          // Here's the order of precedence for the special expressions, which
          // is pretty tricky in JS. Actually, this is simplified by disallowing
          // new without argument lists. That's nestable to the right and makes
          // parsing ambiguous without state so far as I can tell. (With state,
          // we can count the number of open "new"s and turn calls into
          // new-with-args depth-first.)
          // - literals (strings, numbers, array and object literals, etc.)
          // - (grouped subexpressions)
          // - new with an argument list
          // - foo(bar), foo.bar and foo[bar] chains
          //   - Note that the first fragment of one of these can be eg.
          //     new Date().hours but not new Date.hours
          // - new without args. these are right-associative and nestable.
          // TODO(braden): new without args. Makes a huge mess of the parser.

          // Level 0: Literals
          var: sym('identifier'),

          decimalDigit: range('0', '9'),
          exponentiator: seq('e', optional('-'), plus(sym('decimalDigit'))),
          decimalLiteral: seq(
            // First part is a string of decimal digits. Allowed to start with 0
            // in Javascript.
            str(plus(sym('decimalDigit'))),
            // Followed by an optional decimal point and trailing value.
            // Note that "3." is legal!
            optional(seq1(1, '.', optional(str(repeat(sym('decimalDigit')))))),
            // And finally an optional exponentiator.
            optional(sym('exponentiator'))),

          hexDigit: alt(sym('decimalDigit'), range('a', 'f'), range('A', 'F')),
          hexLiteral: seq1(1, '0x', str(plus(sym('hexDigit')))),

          octLiteral: seq1(1, '0o', str(plus(range('0', '7')))),
          binLiteral: seq1(1, '0b', str(plus(alt('0', '1')))),

          numLiteral: alt(
            sym('hexLiteral'),
            sym('octLiteral'),
            sym('binLiteral'),
            sym('decimalLiteral')),

          arrayLiteral: bracketed('[', ',', ']', sym('expr')),

          dqString: seq1(1, '"', str(repeat(
              alt(
                seq1(1, '\\', '"'),
                notChar('"')))),
            '"'),
          sqString: seq1(1, "'", str(repeat(
              alt(
                seq1(1, '\\', "'"),
                notChar("'")))),
            "'"),
          stringLiteral: alt(sym('dqString'), sym('sqString')),

          objectKey: pick([0, 4], seq(
            alt(sym('stringLiteral'), sym('var')),
            sym('ws'),
            ':',
            sym('ws'),
            sym('expr')
          )),

          objectLiteral: bracketed('{', ',', '}', sym('objectKey')),

          identList: bracketed('(', ',', ')', sym('identifier')),
          // See below for block.
          functionLiteral: pick([2, 4], seq('function', sym('ws'),
              sym('identList'), sym('ws'), sym('block'))),

          term0: alt(
            sym('arrayLiteral'),
            sym('objectLiteral'),
            sym('stringLiteral'),
            sym('functionLiteral'),
            sym('numLiteral'),
            sym('var')),


          // Level 1: bracketed subexpressions
          bracketedSubExpr: seq1(2, '(', sym('ws'), sym('expr'), sym('ws'), ')'),
          term1: alt(
            sym('bracketedSubExpr'),
            sym('term0')
          ),

          // Level 2: new with an argument list
          newWithArgs: pick([2, 4], seq(gapAfter('new'), sym('ws'),
              sym('term1'), sym('ws'), sym('argList'))),
          term2: alt(
            sym('newWithArgs'),
            sym('term1')
          ),

          // Level 3: Function calls (not new), foo.bar and foo[bar].
          dot_index_call: alt(
            seq1(1, sym('ws'), sym('argList')),
            seq1(3, sym('ws'), '.', sym('ws'), sym('identifier')),
            seq1(3, sym('ws'), '[', sym('ws'), sym('expr'), sym('ws'), ']')),

          term3: seq(sym('term2'), repeat(sym('dot_index_call'))),

          // Master term rule for use by ExprGrammar.
          term: sym('term3'),



          // Statements!
          block: seq1(2, '{', sym('ws'), repeat(sym('statement'), sym('ws')), sym('ws'), '}'),

          nonemptyStatement: alt(
            sym('block'),
            sym('ifStmt'),
            sym('forInStmt'),
            sym('forOfStmt'),
            sym('forStmt'),
            sym('whileStmt'),
            sym('doWhileStmt'),
            sym('switchStmt'),
            sym('tryCatchStmt'),
            sym('withStmt'),
            sym('throwStmt'),
            sym('returnStmt'),
            sym('breakStmt'),
            sym('continueStmt'),
            sym('debuggerStmt'),
            sym('functionLiteral'),
            sym('varDeclStmt')
          ),


          statement: alt(sym('emptyStmt'), sym('nonemptyStatement')),

          // General helpers
          identifier: str(seq(
            alt(range('A', 'Z'), range('a', 'z'), '_', '$'),
            str(repeat(alt(sym('alphaNum'), '_', '$')))
          )),

          argList: bracketed('(', ',', ')', sym('expr')),

          alphaNum: alt(
            range('0', '9'),
            range('a', 'z'),
            range('A', 'Z')),

          commentLine: seq('//', repeat0(notChar('\n'))),
          commentBlock: seq('/*', repeat0(not('*/', anyChar)), '*/'),
          ws_: alt(' ', '\t', '\n', '\r', '\v'),
          ws: repeat0(alt(
            sym('ws_'),
            sym('commentLine'),
            sym('commentBlock')
          )),
          // At least one whitespace, for eg. new and delete.
          ws1: seq1(1,
            alt(sym('ws_'), sym('commentLine'), sym('commentBlock')),
            sym('ws')
          ),
        };
        g.addActions({
          decimalLiteral: function(xs) {
            // [base, decimal, opt_exponentiator]
            var text = xs[0];
            var value = +(xs[0]); // As a decimal number.
            if (typeof xs[1] !== 'undefined') {
              value = +(xs[0] + '.' + xs[1]);
              text += '.' + xs[1];
            }
            if (xs[2]) {
              var expText = 'e' + (xs[2][1] || '') + xs[2][2];
              text += expText;
              value *= Math.pow(10, +(expText.substring(1)));
            }

            return self.ExprNumericLiteral.create({
              text: text,
              value: value
            });
          },
          octLiteral: function(xs) {
            return self.ExprNumericLiteral.create({ text: xs,
                value: parseInt(xs, 8), base: 8 });
          },
          hexLiteral: function(xs) {
            return self.ExprNumericLiteral.create({ text: xs,
                value: parseInt(xs, 16), base: 16 });
          },
          binLiteral: function(xs) {
            return self.ExprNumericLiteral.create({ text: xs,
                value: parseInt(xs, 2), base: 2 });
          },

          arrayLiteral: function(xs) {
            return self.ExprArrayLiteral.create({ elements: xs });
          },

          objectLiteral: function(xs) {
            // Each element is an array [key, value]. Just store that for now.
            return self.ExprObjectLiteral.create({ elements: xs });
          },

          stringLiteral: function(xs) {
            return self.ExprStringLiteral.create({ value: xs });
          },

          var: function(xs) {
            return self.ExprVar.create({ name: xs });
          },
          newWithArgs: function(xs) {
            console.log('new with args', xs);
            return self.ExprNew.create({ expr: xs[0], params: xs[1] });
          },
          term3: function(xs) { // Chain of dots, indexing and calls.
            // [ term2, [dot_or_index...] ]
            var base = xs[0];
            for (var i = 0; i < xs[1].length; i++) {
              var x = xs[1][i];
              if (typeof x === 'string') { // .foo
                base = self.ExprDot.create({ target: base, selector: x });
              } else if (Array.isArray(x)) { // (foo, bar, baz)
                base = self.ExprCall.create({ expr: base, params: x });
              } else { // [foo]
                base = self.ExprIndex.create({ target: base, selector: x });
              }
            }
            return base;
          },

          ifStmt: function(xs) {
            console.log(xs);
            return self.StmtIf.create({
              condition: xs[0][0],
              ifBlock: xs[0][1],
              elseBlock: xs[1],
            });
          },
        });
        return g;
      }
    },
  ],

  methods: [
    function execute() {
      var p = this.parser.parseString('{ "k": 2+3, k2 : [a,b] }');
      console.log.json(p);
    },
  ]
});
