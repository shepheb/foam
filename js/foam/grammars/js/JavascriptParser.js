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
    'foam.grammars.js.ast.ExprAssignment',
    'foam.grammars.js.ast.ExprBinOp',
    'foam.grammars.js.ast.ExprCall',
    'foam.grammars.js.ast.ExprDot',
    'foam.grammars.js.ast.ExprIndex',
    'foam.grammars.js.ast.ExprNew',
    'foam.grammars.js.ast.ExprNumericLiteral',
    'foam.grammars.js.ast.ExprPrefix',
    'foam.grammars.js.ast.ExprPostfix',
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

          // TODO(braden): String literals.
          // TODO(braden): Object literals.
          // TODO(braden): Array literals.

          term0: alt(sym('numLiteral'), sym('var')),

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


          // General helpers
          identifier: str(seq(
            alt(range('A', 'Z'), range('a', 'z'), '_', '$'),
            str(repeat(alt(sym('alphaNum'), '_', '$')))
          )),

          argList: seq1(1, '(',
            repeat(
              seq1(1, sym('ws'), sym('expr')),
              seq(sym('ws'), ',')),
            sym('ws'), ')'),

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
            console.log.json('decimalLiteral', xs);
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
        });
        return g;
      }
    },
    {
      name: 'oldParser',
      lazyFactory: function() {
        // All the binary ops have this form:
        var self = this;
        function binOp(prec) {
          // expr  ws
          // expr1 ws [op ws expr2]
          // 0     1  2
          //           0  1  2
          // NB: The precedence here is backwards.
          // We need to correct it. There are four cases:
          // 1. Single term - just return it
          // 2. Two simple terms - build a binop.
          // 3. RHS is binop with different precedence - build a binop.
          // 4. RHS is binop with same precedence - follow its LHS branches to the
          //    first value that is not a binop with this precedence. Make that value
          //    the RHS of a new binop.
          // TODO(braden): This is obviously horrible and should be changed as
          // soon as we can do left-recursion.

          return function(xs) {
            if ( self.Expr.isInstance(xs) ) return xs;
            if ( ! xs[2] ) return xs[0]; // Case 1.

            var lhs = xs[0];
            var rhs = xs[2][2];
            var op  = xs[2][0];

            var child = rhs;
            var parent;

            while ( self.ExprBinOp.isInstance(child) && child.prec == prec ) {
              parent = child;
              child = parent.lhs;
            }
            // Now parent is either undefined or the parent node, and child is the
            // first non-this-op item on the left branch.
            // So we build a new binop for this op with lhs and child.
            var me = self.ExprBinOp.create({
              lhs: lhs,
              rhs: child,
              prec: prec,
              op: op
            });

            if ( ! parent ) {
              // Parent is not defined (case 2): just return the new op.
              return me;
            }

            // Otherwise, install the new op in place of the child, in the parent.
            parent.lhs = me;
            // And return the original rhs, which is the top of the expanded tree.
            return rhs;
          };
        }

        var JSParser = {
          __proto__: grammar,

          //START: seq1(1,
          //  sym('whitespace'),
          //  repeat(sym('toplevel'), sym('whitespace'), 1 /* min */),
          //  sym('whitespace')),

          START: sym('stmtFor'),

          vardecl: seq(
            'var',
            sym('whitespace'),
            sym('identifier'),
            sym('whitespace'),
            alt(
              literal(';'),
              seq(literal('='), sym('whitespace'), sym('expr'), sym('whitespace'), literal(';'))
            )
          ),

          identifier: seq(
            alt(range('a', 'z'), range('A', 'Z'), literal('_'), literal('$')),
            repeat(alt(range('a', 'z'), range('A', 'Z'), range('0', '9'), literal('_'), literal('$')))
          ),

          whitespace: repeat0(alt(
            literal(' '), literal('\t'), literal('\r'), literal('\n'),
            seq(literal('//'), repeat0(notChar('\n'))),
            seq(literal('/*'), repeat0(not(literal('*/'))))
          )),


          // Statements
          stmt: alt(
            sym('stmtIf'),
            sym('stmtFor'),
            sym('stmtWhile'),
            sym('stmtAsst'),
            // TODO(braden): Missing return, delete statements. Also with,
            // do-while, probably more.
            // TODO(braden): One-liners.
            // TODO(braden): for (var key in obj) loops too.
            seq(sym('expr'), sym('whitespace'), ';')
          ),

          block: seq1(1, '{', sym('innerBlock'), '}'),

          innerBlock: seq1(1,
            sym('whitespace'),
            repeat(sym('stmt'), sym('whitespace')),
            sym('whitespace')
          ),

          // TODO: one-line if?
          ifcore: pick([4, 8], seq(
            'if',
            sym('whitespace'),
            '(',
            sym('whitespace'),
            sym('expr'),
            sym('whitespace'),
            ')',
            sym('whitespace'),
            sym('block')
          )),

          stmtIf: pick([0, 2, 4], seq(
            sym('ifcore'),
            sym('whitespace'),
            repeat(
              seq1(2,
                'else',
                sym('whitespace'),
                sym('ifcore')
              ),
              sym('whitespace')
            ),
            sym('whitespace'),
            optional(seq1(2,
              'else',
              sym('whitespace'),
              sym('block')
            ))
          )),

          // TODO: Smarter for loops
          // TODO: One-liners?
          stmtFor: pick([4, 8, 12, 16], seq(
            'for',
            sym('whitespace'),
            '(',
            sym('whitespace'),
            sym('vardecl'),
            sym('whitespace'),
            ';',
            sym('whitespace'),
            sym('expr'),
            sym('whitespace'),
            ';',
            sym('whitespace'),
            sym('expr'),
            sym('whitespace'),
            ')',
            sym('whitespace'),
            sym('block')
          )),

          stmtWhile: pick([4, 8], seq(
            'while',
            sym('whitespace'),
            '(',
            sym('whitespace'),
            sym('expr'),
            sym('whitespace'),
            ')',
            sym('whitespace'),
            sym('block')
          )),

          stmtAsst: pick([0, 2, 5], seq(
            // Only some expressions (those with lvalue true) are allowed here
            // on the left-hand side.
            sym('expr'),
            sym('whitespace'),
            optional(sym('inlineop')),
            '=',
            sym('whitespace'),
            sym('expr'),
            sym('whitespace'),
            ';'
          )),
          inlineop: alt('+', '-', '*', '/', '%', '<<', '>>', '>>>', '||', '|', '&', '^'),

          // Expressions!
          // We work from loosest binding to tightest.
          // TODO: Ternary operator.
          // TODO(braden): Object and array literals are expressions.
          // TODO(braden): Functions are expressions too.
          expr: pick([0, 2], seq(
            sym('expr2'),
            sym('whitespace'),
            optional(seq1(2, '||', sym('whitespace'), sym('expr')))
          )),

          expr2: pick([0, 2], seq(
            sym('expr3'),
            sym('whitespace'),
            optional(seq1(2, '&&', sym('whitespace'), sym('expr2')))
          )),

          expr3: pick([0, 2], seq(
            sym('expr4'),
            sym('whitespace'),
            optional(seq1(2, '|', sym('whitespace'), sym('expr3')))
          )),

          expr4: pick([0, 2], seq(
            sym('expr5'),
            sym('whitespace'),
            optional(seq1(2, '^', sym('whitespace'), sym('expr5')))
          )),

          expr5: pick([0, 2], seq(
            sym('expr6'),
            sym('whitespace'),
            optional(seq1(2, '&', sym('whitespace'), sym('expr5')))
          )),

          expr6: pick([0, 2], seq(
            sym('expr7'),
            sym('whitespace'),
            optional(pick([0, 2], seq(sym('eqop'), sym('whitespace'), sym('expr6'))))
          )),
          eqop: alt('==', '===', '!=', '!=='),

          // TODO: instanceof?
          // TODO: in?
          expr7: seq(
            sym('expr8'),
            sym('whitespace'),
            optional(seq(sym('relop'), sym('whitespace'), sym('expr7')))
          ),
          relop: alt('<', '<=', '>', '>='),

          expr8: seq(
            sym('expr9'),
            sym('whitespace'),
            optional(seq(sym('shiftop'), sym('whitespace'), sym('expr8')))
          ),
          shiftop: alt('<<', '>>', '>>>'),

          expr9: seq(
            sym('expr10'),
            sym('whitespace'),
            optional(seq(sym('addop'), sym('whitespace'), sym('expr9')))
          ),
          addop: alt('+', '-'),

          expr10: seq(
            sym('expr11'),
            sym('whitespace'),
            optional(seq(sym('mulop'), sym('whitespace'), sym('expr10')))
          ),
          mulop: alt('%', '*', '/'),

          expr11: alt(
            seq('+', sym('expr12')),
            seq('-', sym('expr12')),
            sym('expr12')
          ),

          expr12: alt(
            seq('~', sym('whitespace'), sym('expr13')),
            sym('expr13')
          ),

          expr13: alt(
            seq('!', sym('whitespace'), sym('expr13')),
            sym('expr14')
          ),

          expr14: seq(
            sym('expr15'),
            sym('whitespace'),
            optional(alt('--', '++'))
          ),

          expr15: seq(
            sym('expr16'),
            sym('whitespace'),
            repeat(
              seq(
                '(',
                repeat(seq(sym('whitespace'), sym('expr')),
                       seq(sym('whitespace'), ',')),
                sym('whitespace'),
                ')'
              ),
              sym('whitespace')
            )
          ),

          expr16: seq(
            sym('expr17'),
            sym('whitespace'),
            repeat(
              seq(
                alt(seq('.', sym('whitespace'), sym('identifier')),
                    seq('[', sym('whitespace'), sym('expr'), sym('whitespace'), ']')),
                sym('whitespace')
              ),
              sym('whitespace')
            )
          ),

          expr17: alt(
            seq('(', sym('expr'), ')'),
            sym('expr18')
          ),

          // TODO: Numeric literals.
          expr18: sym('identifier')
        };

        JSParser.addActions({
          vardecl: function(xs) {
            // type ws ident ws [semi; = ws expr ws ;]
            // 0    1  2     3   4     4 5  6    7  8
            return xs;
          },

          vardecl: function(xs) {
            // type ws ident ws semi
            // type ws ident ws = ws expr ws ;
            // 0    1  2    3   4 5  6    7  8
            var obj = {
              type: xs[0],
              name: xs[2]
            };
            if ( xs[4] === '=' ) obj.expr = xs[6];
            return FSASTVarDecl.create(obj);
          },

          identifier: function(xs) {
            // first [rest]
            // 0     1
            return xs[0] + xs[1].join('');
          },

          whitespace: function() { return ''; },

          // Returns an FSType value, not an AST node.
          type: function(xs) {
            // type undefined
            // type [ < [ [ '', type] ] >
            if (typeof xs[1] === 'undefined') {
              return FSType.create({ baseType: xs[0] });
            } else {
              return FSType.create({
                baseType: xs[0],
                innerTypes: xs[1][1]
              });
            }
          },

          // Returns an Array of FSType values, not an AST node.
          typelist: function(xs) {
            return xs.map(function(t) { return t[1]; });
          },

          // Returns an FSASTStmt-family value.
          stmt: function(xs) {
            if ( FSASTStmt.isInstance(xs) ) return xs;
            // Otherwise: expr ws ;
            //            0    1  2
            return FSASTStmtExpr.create({ expr: xs[0] });
          },

          // Returns a FSASTStmtIf.
          ifcore: function(xs) {
            // if ws ( ws expr ws ) ws block
            // 0  1  2 3  4    5  6 7  8
            return FSASTStmtIf.create({
              condition: xs[4],
              ifBlock: xs[8]
            });
          },

          // Returns a FSASTStmtIf that holds the complete story.
          stmtIf: function(xs) {
            // ifcore ws [elseif] ws [else, ws, block]
            // 0      1  2        3  4 0    1   2
            // Add the elseifs if present
            console.log(xs, '\n\n\n');
            if ( xs[2] && xs[2].length ) xs[0].elseifs = xs[2].map(function(ys){ return ys[2]; });
            // And the else block if present
            if ( xs[4] && xs[4].length ) xs[0].elseBlock = xs[4][2];
            return xs[0];
          },

          // Returns a FSASTStmtFor.
          stmtFor: function(xs) {
            // for ws ( ws initializer ws condition ws ; ws increment ws ) ws block
            // 0   1  2 3  4           5  6         7  8 9  10        11 1213 14
            return FSASTStmtFor.create({
              initializer: xs[4],
              condition: xs[6],
              increment: xs[10],
              block: xs[14]
            });
          },

          // Returns a FSASTStmtWhile.
          stmtWhile: function(xs) {
            // while ws ( ws cond ws ) ws block
            // 0     1  2 3  4    5  6 7  8
            return FSASTStmtWhile.create({
              condition: xs[4],
              block: xs[8]
            });
          },

          // Returns a FSASTStmtAsst.
          stmtAsst: function(xs) {
            // lvalue ws [inlineop] = ws rvalue ws ;
            // 0      1  2 0        3 4  5      6  7
            return FSASTStmtAsst.create({
              lvalue: xs[0],
              rvalue: xs[5],
              op: xs[2] && xs[2].length ? xs[2][0] : ''
            });
          },

          // Logical ||
          expr: binOp(1),
          // Logical &&
          expr2: binOp(2),
          // Bitwise |
          expr3: binOp(3),
          // Bitwise ^
          expr4: binOp(4),
          // Bitwise &
          expr5: binOp(5),
          // Equalities
          expr6: binOp(6),
          // Inequalities
          expr7: binOp(7),
          // Bit-shifting operations.
          expr8: binOp(8),
          // Addition operations
          expr9: binOp(9),
          // Multiplicative operations
          expr10: binOp(10),

          // unary + and -
          expr11: function(xs) {
            // + expr
            // - expr
            // expr
            if ( FSASTExpr.isInstance(xs) ) return xs;
            return FSASTExprUnaryMath.create({
              expr: xs[1],
              op: xs[0]
            });
          },

          // unary ~
          expr12: function(xs) {
            // '~' ws expr
            // expr
            if ( FSASTExpr.isInstance(xs) ) return xs;
            return FSASTExprBitwiseNegate.create({
              expr: xs[2]
            });
          },

          // unary !
          expr13: function(xs) {
            // '!' ws expr
            // expr
            // 0   1  2
            if ( FSASTExpr.isInstance(xs) ) return xs;
            return FSASTExprBooleanNegate.create({
              expr: xs[2]
            });
          },

          // postfix -- and ++
          expr14: function(xs) {
            // expr ws ('--' or '++')
            if ( FSASTExpr.isInstance(xs) ) return xs;
            var inner = xs[0];
            if ( xs[2] ) {
              return FSASTExprPostfix.create({
                op: xs[2],
                expr: inner
              });
            }
            return inner;
          },

          // Function calls
          expr15: function(xs) {
            // subexpr ws [calls]
            // 0       1  2
            // calls: '(' [[ws, expr]] ')'
            //        0   1             2
            if ( FSASTExpr.isInstance(xs) ) return xs;
            var ast = xs[0];
            var calls = xs[2];

            for ( var i = 0 ; i < calls.length ; i++ ) {
              var c = calls[i];
              ast = FSASTExprCall.create({
                expr: ast,
                params: c[1].map(function(x) { return x[1]; })
              });
            }

            return ast;
          },


          // field.accessors and array[indexes].
          expr16: function(xs) {
            // expr17 ws [ dot-and-index-chain ]
            // 0      1  2
            // the chain is either ['.' ws identifier] or ['[' ws expr ws ']']
            if ( FSASTExpr.isInstance(xs) ) return xs;
            var ast = xs[0];
            var list = xs[2];

            // If there are entries in the list, we build nested ASTs, left-associative.
            // If the list is empty, we'll just end up returning ast, which is correct.
            for ( var i = 0 ; i < list.length ; i++ ) {
              var a = list[i][0];
              ast = (a[0] === '.' ? FSASTExprDot : FSASTExprIndex).create({
                expr: ast, selector: a[2]
              });
            }
            return ast;
          },

          // Primitive or bracketed subexpr.
          expr17: function(xs) {
            // AST: identifier
            // ( expr )
            // 0 1 2
            if ( FSASTExpr.isInstance(xs) ) return xs;
            return xs[1];
          },

          // TODO: Numeric literals.
          expr18: function(xs) {
            return FSASTExprVar.create({ name: xs });
          }
        });
        return JSParser;
      }
    },
  ],

  methods: [
    function execute() {
      var p = this.parser.parseString('0b1101');
      console.log.json(p);
      console.log.json(p.tail);
    },
  ]
});
