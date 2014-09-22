
require('../core/bootFOAMnode');
require('../node/fileDAO');
var daoServer = require('../node/server');

// Create an XMLFileDAO against FUNTests.xml
var dao = XMLFileDAO.create({ name: 'FUNTests.xml', model: UnitTest });

dao.find('asynchronized', { put: function(x) { console.log(x); console.log('========'); console.log(JSONUtil.stringify(x)); } });

daoServer.launchServer({
  daoMap: { 'UnitTestDAO': dao },
  port: 8888,
  static: '..'
});

