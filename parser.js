// Run with:
//   $ node parser.js [file]

var parser = require('./interpreter/ebfpp.js');
var fs = require('fs');
var util = require('util');

if (process.argv.length <3) {
    console.error('Need a file to parse. Run with:\n  $ node parser.js [file]');
    process.exit(1);
}

var ebfpp_code = fs.readFileSync(process.argv[2], 'utf8');
var ast = parser.parse(ebfpp_code);
console.log(util.inspect(ast, {depth: null}));
