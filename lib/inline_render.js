var page = require('webpage').create()
  , sys = require('system')
  , util = require('./util')
  // , unique = require('lodash.uniq')
  ;

var args = sys.args
  , fs = require('fs')
  , currentFolder = fs.absolute(args[0])
  , staticFolder = currentFolder.substring(0, currentFolder.lastIndexOf('/')) + '/../static'
  , file = 'file://' + staticFolder + '/ad_template.html'
  ;

var output = args[1];
var resources = [];

// console.error somehow goes to stdout when node sees it. Use sys.stderr.write seems to be right
sys.stderr.write("output: " + output + "\n");
sys.stderr.write("html file " + file + "\n");


page.onResourceRequested = function(request) {
    resources.push(request.url);
};

// page.onLoadFinished = function() {
//     // sys.stderr.write('::rendering');
//     page.render(output);
//     // sys.stderr.write('::resources ' + JSON.stringify({resources: resources}));
//     phantom.exit();
// };
// page.onConsoleMessage = function(msg) {
//     console.log(msg);
// };


page.viewportSize = { width: 1280, height: 800 };


page.open(file, function(status) {
    if ( status === "success" ) {
        util.waitFor(
            function() {
                return page.evaluate(function() {
                    return $("#done").is(":visible");
                });
            }, 
            function() {
                var chars = page.evaluate(function() {
                    return $("#done").html();
                });
                // resources = unique(resources);
                page.render(output);

                // sys.stdout.write(JSON.stringify({resources: resources}));
                sys.stdout.write(JSON.stringify(
                  { 
                    key: chars
                  }));

                phantom.exit();
            });
    }
});

