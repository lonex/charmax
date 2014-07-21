var page = require('webpage').create()
  , sys = require('system')
  , fs = require('fs')
  // , util = require('./util')
  , _ = require('lodash')
  ;

var args = sys.args
  , fs = require('fs')
  , currentFolder = fs.absolute(args[0])
  , staticFolder = currentFolder.substring(0, currentFolder.lastIndexOf('/')) + '/../static'
  , debugFolder  = currentFolder.substring(0, currentFolder.lastIndexOf('/')) + '/../build'
  , file = 'file://' + staticFolder + '/ad_template.html'
  , debugOutput = debugFolder + '/ad_template.html'
  ;

var resources = [];

// console.error somehow goes to stdout when node sees it. Use sys.stderr.write seems to be right
sys.stderr.write("Debug output -> " + debugOutput + "\n");


page.onResourceRequested = function(request) {
  resources.push(request.url);
};

page.viewportSize = { width: 1280, height: 800 };

page.open(file, function(status) {
  if ( status === "success" ) {
    var chars = page.evaluate(function() {
      var result = {}
        , idPattern = /^ad_\d+x\d+$/i;

      $(".measure").each(function() {
        var el = $(this);
        var id = el.attr('id');
        if (idPattern.test(id)) {
          result[id] = el.text().length;
        }
      });
      return result;
    });

    fs.write(debugOutput, page.content, 'w');
    sys.stdout.write(JSON.stringify(chars));
    phantom.exit();
  }
});

