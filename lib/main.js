
var args = process.argv.slice(2);

// if (args.length > 1) {
//     throw new Error('Argument error');
// }

var fs               = require('fs')
  , shell            = require('child_process').execFile
  , phantomjs        = require('phantomjs').path
  , phantomjsScript  = __dirname + '/inline_render.js'
  // , output           = args[0]
  ;

var resp;

console.log("phantomjs path " + phantomjs);
// console.log("args " + args);
// console.log("output " + output);

render();

function render() {
    shell(phantomjs, [phantomjsScript], [], function(err, stdout, stderr) {
        console.log("in processing...");

        if (err) throw err;

        try {
            resp = JSON.parse(stdout);
            console.log("::resp " + resp['key']);
        } catch(err) {
            log('Error');
            error(err);
        }
    });
}

function log(message) {
    process.stdout.write(message + '\n');
}

function error(err) {
    process.stderr.write(err);
}
