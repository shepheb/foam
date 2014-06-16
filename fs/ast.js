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

