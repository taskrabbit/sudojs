var $ = require('sudoclass'),
  Filereader = require('./filereader.js'),
  Filewriter = require('./filewriter.js');

/**
 * The loop in which we do stuff...
 */
var Builder = function(filename, v, pf) {
  this.construct({
    filename: filename,
    version: v,
    pathfinder: pf
  });
};

Builder.prototype = Object.create($.Model.prototype);

Builder.prototype.build = function() {
  // the reader
  this.FR = new Filereader(this.get('filename'), 
    this.get('pathfinder'));
  // set the callback for parseHtmlFile
  this.FR.observe(this.readerScriptsParsed.bind(this));
  this.printline("Reading HTML file: " + this.get('filename'));
  this.FR.readHtmlFile();
  console.log(" - parsing file content, collecting script sources");
  this.FR.parseHtmlFile();
};

// the reader has finished parsing the script links
Builder.prototype.readerScriptsParsed = function(change) {
  if(change.name === 'scripts_parsed' && change.object[change.name]) {
    var version = 'sudo.version = "' + this.get('version') + '";\n';
    console.log(" - concatonating all scripts to a single `String`");
    this.FR.concatonateSources();
    // the writer
    var FW = new Filewriter(this.get('filename'),
      this.get('pathfinder'));
    this.printline("Writing `debug version` of file: " + FW.get('filename'));
    // include the version number in the string data
    FW.writeDebug(this.FR.get('concat_source') + version);
    console.log(" - debug file written");	
  }
};

Builder.prototype.printline = function(line) {
  console.log(line);
  console.log('=========================');
};

module.exports = Builder;
