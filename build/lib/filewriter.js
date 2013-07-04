var fs = require('fs'),
  path = require('path'),
  $ = require('sudoclass');

/**
 * @param {string} filename
 * @param {object} pf A Pathfinder instance
 * @constructor
 */
var Filewriter = function(filename, pf) {
  this.construct({
    pathfinder: pf
  });
  this.extToJs(filename);
};

Filewriter.prototype = Object.create($.Model.prototype);

/**
 * we are scraping from an `html` file remove the ext and
 * replace it with the proper `js`
 */
Filewriter.prototype.extToJs = function(filename) {
  var bse = path.basename(filename, '.html');
  this.set('filename', bse + '.js');
};

Filewriter.prototype.writeDebug = function(data) {
  var a = '(function(window) {\n',
    // TODO provide a command line flag to leave out the underscore alias
    b = this.get('noUnderscore') ?
      'window.sudo = sudo;\n}).call(this, this);' :
      'window.sudo = sudo;\nif(typeof window._ === "undefined") window._ = sudo;\n}).call(this, this);',
    c = a + data + b,
  // assemble a full path
    debug = this.get('pathfinder').get('debug_path'),
    stat = fs.statSync(debug), 
    full = debug + '/' + this.get('filename');
  // make sure its a directory
  if(stat.isDirectory()) {
    fs.writeFileSync(full, c, 'utf8');
  }
};

module.exports = Filewriter;
