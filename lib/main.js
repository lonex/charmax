
var args = process.argv.slice(2);

var fs               = require('fs')
  , shell            = require('child_process').execFile
  , jade             = require('jade')
  , _                = require('lodash')
  , phantomjs        = require('phantomjs').path
  , phantomjsScript  = __dirname + '/inline_render.js'
  , adTemplate       = __dirname + '/../templates/ad.jade'
  , outputHtml       = __dirname + '/../build/ad.html'
  ;

var resp;

var options = {
    pretty: true
  // , debug: true
  // , compileDebug: true
};

console.log("phantomjs path " + phantomjs);
console.log("args " + args);
console.log("adTemplate " + adTemplate);

render();

function render() {
  jade.renderFile(adTemplate, _.merge(options, {}), function(err, html) {
    if (err) throw err;
    console.log('Save html to ' + outputHtml);

    fs.writeFileSync(outputHtml, html);

    shell(phantomjs, [phantomjsScript, outputHtml], [], function(err, stdout, stderr) {
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
  });
}

function log(message) {
    process.stdout.write(message + '\n');
}

function error(err) {
    process.stderr.write(err);
}
