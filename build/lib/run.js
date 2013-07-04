/*jsl:declare process*/

var i, curr, version = process.argv[2],
  Pathfinder = require('./pathfinder.js'),
  Builder = require('./builder.js'),
  PF = new Pathfinder();

console.log(version);

// any pages to be scanned (assumed to be in `root`) will
// be at argv[3] or greater
for(i = 3; i < process.argv.length; i++) {
  // TODO read the version from a file
  curr = new Builder(process.argv[i], version, PF);
  curr.build();
  curr = null;
}
