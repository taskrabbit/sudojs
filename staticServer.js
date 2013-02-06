/**
 * Creates a static server and serves this folder so the tests can be 
 * run from various browsers and Virtual Machines (READ no IE filesystem weirdness)
 *
 * requires Node.js and the module 'node-static'
 */

var static = require('node-static');
var files = new static.Server();

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        files.serve(request, response);
    });
}).listen(5678);
