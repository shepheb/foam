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
  package: 'foam.grammars',
  name: 'ExprGrammar',
  methods: [
    function build(args) {
      var g = { __proto__: grammar };
      var actions = {};

      // Starting from the tightest precedence upward, we construct our
      // expression grammar.
      // NB: Each precedence level should avoid mixing types. All operators that
      // share a precedence level should share a type (prefix, postfix,
      // infixLeft, and infixRight).
      var prev = args.termName;
      for (var i = 0; i < args.operations.length; i++) {
        var ops = args.operations[i];
        var opsParser = alt.apply(null, ops.mapProp('op'));
        var type = ops[0].type;
        var opMap = {};
        for (var j = 0; j < ops.length; j++) {
          opMap[ops[j].op] = ops[j];
          if (type !== ops[j].type) {
            console.warn('ExprParser: Different op types at the same precedence level are not supported');
          }
        }
        var name = '__expr_' + i;

        if (type === 'postfix') {
          g[name] = seq(sym(prev), optional(seq1(1, args.skip, opsParser)));
          actions[name] = this.postfixAction.bind(null, opMap);
        } else if (type === 'prefix') {
          g[name] = alt(
            seq(opsParser, args.skip, sym(prev)),
            sym(prev)
          );
          actions[name] = this.prefixAction.bind(null, opMap);
        } else if (type === 'infixLeft' || type === 'infixRight') {
          // Infix is the same parser for either associativity, only the action
          // needs to care about that.
          g[name] = repeat(
              sym(prev),
              seq1(1, args.skip, opsParser, args.skip),
              1, undefined, true /* keep_delims */);

          actions[name] = this.infixAction.bind(null, type === 'infixLeft', opMap);
        } else {
          console.warn('ExprParser: Bad type ' + type);
        }

        prev = name;
      }

      g[args.symbolName] = sym(prev);
      g.addActions(actions);
      return g;
    },
    function postfixAction(opMap, xs) {
      //console.log.json('postfixAction', Object.keys(opMap), xs);
      var ret = typeof xs[1] === 'undefined' ? xs[0] :
          opMap[xs[1]].output(xs[0], xs[1]);
      //console.log.json('   ', ret);
      return ret;

    },
    function prefixAction(opMap, xs) {
      //console.log.json('prefixAction', Object.keys(opMap), xs);
      var ret = Array.isArray(xs) ? opMap[xs[0]].output(xs[0], xs[2]) : xs;
      //console.log.json('   ', ret);
      return ret;
    },
    function infixAction(fromLeft, opMap, xs) {
      // xs is [arg1, op1, arg2, op2, ..., argN-1, opN-1, argN].
      //console.log('infixAction', fromLeft ? 'left' : 'right', Object.keys(opMap), Array.isArray(xs), xs);
      if (xs.length === 1) return xs[0];
      var total;
      if (fromLeft) {
        total = xs[0];
        for (var i = 1; i < xs.length; i += 2) {
          total = opMap[xs[i]].output(total, xs[i], xs[i + 1]);
        }
      } else {
        total = xs[xs.length - 1];
        for (var i = xs.length - 2; i >= 0; i -= 2) {
          total = opMap[xs[i]].output(xs[i - 1], xs[i], total);
        }
      }
      //console.log.json('    ', total);
      return total;
    },
  ]
});
