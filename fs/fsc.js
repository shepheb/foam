require('../core/bootFOAMnode');

require('./ast');
require('./parsing');
require('./types');

var nfs = require('fs');

FOAModel({
  name: 'FSCompiler',
  properties: [
    'ast'
  ],

  methods: {
    compile: function(files) {
      // Concat all the files into one and then parse them all.
      var code = [];
      for ( var i = 0 ; i < files.length ; i++ ) {
        code.push(nfs.readFileSync(files[i]));
      }
      code = code.join('\n\n');

      this.ast = FSParser.parseString(code);
      var tc = FSTypeChecker.create();
      tc.check(this.ast);
      console.log(this.ast);
    }
  }
});



