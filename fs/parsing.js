// TODO: Remove me. Debugging only.
require('../core/bootFOAMnode');
require('./ast');


var util = require('util');

DEBUG_PARSE = true;

var FSParser = {
  __proto__: grammar,

  //START: seq1(1,
  //  sym('whitespace'),
  //  repeat(sym('toplevel'), sym('whitespace'), 1 /* min */),
  //  sym('whitespace')),

  START: sym('expr'),

  toplevel: alt(
    sym('model'),
    sym('function'),
    sym('vardecl')
  ),

  vardecl: seq(
    sym('type'),
    sym('whitespace'),
    sym('identifier'),
    sym('whitespace'),
    alt(
      literal(';'),
      seq(literal('='), sym('whitespace'), sym('expr'), sym('whitespace'), literal(';'))
    )
  ),

  type: alt(
    literal('var'),
    seq(
      sym('identifier'),
      optional(seq(
        literal('<'),
        sym('typelist'),
        sym('whitespace'),
        literal('>')
      ))
    )
  ),

  typelist: repeat(
    seq(sym('whitespace'), sym('type')),
    seq(sym('whitespace'), literal(',')),
    1 /* min */
  ),

  identifier: seq(
    alt(range('a', 'z'), range('A', 'Z'), literal('_'), literal('$')),
    repeat(alt(range('a', 'z'), range('A', 'Z'), range('0', '9'), literal('_'), literal('$')))
  ),

  // TODO: Switch to repeat0 when it's fixed.
  whitespace: repeat0(alt(
    literal(' '), literal('\t'), literal('\r'), literal('\n'),
    seq(literal('//'), repeat0(notChar('\n'))),
    seq(literal('/*'), repeat0(not(literal('*/'))))
  )),


  // Expressions!
  // We work from loosest binding to tightest.
  // TODO: Shorthand assignment operators.
  // TODO: Ternary operator.
  expr: seq(
    sym('expr2'),
    optional(seq(
      sym('whitespace'),
      '||',
      sym('whitespace'),
      sym('expr')
    ))
  ),

  expr2: seq(
    sym('expr3'),
    optional(seq(sym('whitespace'), '&&', sym('whitespace'), sym('expr2')))
  ),

  expr3: seq(
    sym('expr4'),
    optional(seq(sym('whitespace'), '|', sym('whitespace'), sym('expr3')))
  ),

  expr4: seq(
    sym('expr5'),
    optional(seq(sym('whitespace'), '^', sym('whitespace'), sym('expr5')))
  ),

  expr5: alt(
    seq(sym('expr5'), sym('whitespace'), '&', sym('whitespace'), sym('expr6')),
    sym('expr6')
  ),

  expr6: alt(
    seq(sym('expr6'), sym('whitespace'), sym('eqop'), sym('whitespace'), sym('expr7')),
    sym('expr7')
  ),
  eqop: alt('==', '===', '!=', '!=='),

  // TODO: instanceof?
  // TODO: in?
  expr7: alt(
    seq(sym('expr7'), sym('whitespace'), sym('relop'), sym('whitespace'), sym('expr8')),
    sym('expr8')
  ),
  relop: alt('<', '<=', '>', '>='),

  expr8: alt(
    seq(sym('expr8'), sym('whitespace'), sym('shiftop'), sym('whitespace'), sym('expr9')),
    sym('expr9')
  ),
  shiftop: alt('<<', '>>', '>>>'),

  expr9: alt(
    seq(sym('expr9'), sym('whitespace'), sym('addop'), sym('whitespace'), sym('expr10')),
    sym('expr10')
  ),
  addop: alt('+', '-'),

  expr10: alt(
    seq(sym('expr10'), sym('whitespace'), sym('mulop'), sym('whitespace'), sym('expr11')),
    sym('expr11')
  ),
  mulop: alt('%', '*', '/'),

  expr11: alt(
    seq('+', sym('expr12')),
    seq('-', sym('expr12')),
    sym('expr12')
  ),

  expr12: alt(
    seq('~', sym('expr13')),
    sym('expr13')
  ),

  expr13: alt(
    seq('!', sym('expr14')),
    sym('expr14')
  ),

  expr14: alt(
    seq(sym('expr15', '--')),
    seq(sym('expr15', '++')),
    sym('expr15')
  ),

  expr15: alt(
    seq(sym('expr15'), sym('whitespace'), '(',
        repeat(seq(sym('whitespace'), sym('expr')),
               seq(sym('whitespace'), ',')),
        sym('whitespace'),
        ')'),
    sym('expr16')
  ),

  expr16: alt(
    seq(sym('expr16'), sym('whitespace'), '.', sym('identifier')),
    seq(sym('expr16'), sym('whitespace'), '[',
        sym('whitespace'), sym('expr'), sym('whitespace'),
        ']'),
    sym('expr17')
  ),

  expr17: alt(
    seq('(', sym('expr'), ')'),
    sym('expr18')
  ),

  expr18: sym('identifier')
};

FSParser.addActions({
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
  }

  /*
  tag: function(xs) {
    // < label ws attributes ws > children </ label >
    // 0 1     2  3          4  5 6        7  8     9

    // Mismatched XML tags
    // TODO: We should be able to set the error message on the ps here.
    if ( xs[1] != xs[8] ) return undefined;

    var obj = { tag: xs[1], attrs: {}, children: xs[6] };

    xs[3].forEach(function(attr) { obj.attrs[attr[0]] = attr[2]; });

    return obj;
  }
  */
});

console.log(util.inspect(FSParser.parseString('foo'), { depth: null }));
//console.log(util.inspect(FSParser.parseString('   '), { depth: null }));

