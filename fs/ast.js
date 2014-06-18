// Support models.
FOAModel({
  name: 'FSType',
  properties: [
    { name: 'baseType', help: 'The primary type' },
    {
      name: 'innerTypes',
      type: 'Array<FSType>',
      help: 'An array of inner types, arguments to the primary type',
      factory: function(){ return []; }
    }
  ]
});


// AST models
FOAModel({
  name: 'FSAST',

  properties: [
    { name: 'kind', help: 'The kind of AST node.' }
  ],

  methods: {
  }
});


FOAModel({
  name: 'FSASTVarDecl',
  extendsModel: 'FSAST',
  properties: [
    { name: 'type', type: 'FSType', required: true },
    { name: 'name', type: 'string', required: true },
    { name: 'value', type: 'FSASTExpr' }
  ]
});

FOAModel({
  name: 'FSASTExpr',
  extendsModel: 'FSAST',
  label: 'Base model for all subexpression types.'
  // TODO: partialEval? Might expose quirks of JS evaluation vs. target lang.
  // Safer to let the host language's compiler do the optimization for now.
});


FOAModel({
  name: 'FSASTExprVar',
  extendsModel: 'FSASTExpr',
  properties: [
    { name: 'name', required: true }
  ]
});

FOAModel({
  name: 'FSASTExprBinOp',
  extendsModel: 'FSASTExpr',
  properties: ['lhs', 'rhs', 'prec', 'op']
});

FOAModel({
  name: 'FSASTExprIndex',
  extendsModel: 'FSASTExpr',
  properties: ['expr', 'selector']
});

FOAModel({
  name: 'FSASTExprDot',
  extendsModel: 'FSASTExpr',
  properties: ['expr', 'selector']
});

FOAModel({
  name: 'FSASTExprCall',
  extendsModel: 'FSASTExpr',
  properties: [
    'expr',
    { name: 'params', factory: function() { return []; } }
  ]
});

FOAModel({
  name: 'FSASTExprPostfix',
  extendsModel: 'FSASTExpr',
  properties: ['expr', 'op']
});

FOAModel({
  name: 'FSASTExprBooleanNegate',
  extendsModel: 'FSASTExpr',
  properties: ['expr']
});

FOAModel({
  name: 'FSASTExprBitwiseNegate',
  extendsModel: 'FSASTExpr',
  properties: ['expr']
});

FOAModel({
  name: 'FSASTExprUnaryMath',
  extendsModel: 'FSASTExpr',
  properties: ['expr', 'op']
});


FOAModel({
  name: 'FSASTStmt',
  extendsModel: 'FSAST',
  label: 'Base class for statement nodes.'
});

FOAModel({
  name: 'FSASTStmtIf',
  extendsModel: 'FSASTStmt',
  properties: ['condition', 'ifBlock', 'elseBlock',
    { name: 'elseifs', factory: function() { return []; } }
  ]
});

FOAModel({
  name: 'FSASTStmtFor',
  extendsModel: 'FSASTStmt',
  properties: ['initializer', 'condition', 'increment', 'block']
});

FOAModel({
  name: 'FSASTStmtWhile',
  extendsModel: 'FSASTStmt',
  properties: ['condition', 'block']
});

FOAModel({
  name: 'FSASTStmtAsst',
  extendsModel: 'FSASTStmt',
  properties: ['lvalue', 'rvalue', 'op']
});

FOAModel({
  name: 'FSASTStmtExpr',
  extendsModel: 'FSASTStmt',
  properties: ['expr']
});

