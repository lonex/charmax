var page = require('webpage').create()
  , sys = require('system')
  , fs = require('fs')
  ;

var args = sys.args
  , fs = require('fs')
  , currentFolder = fs.absolute(args[0])
  , staticFolder = currentFolder.substring(0, currentFolder.lastIndexOf('/')) + '/../templates'
  , debugFolder  = currentFolder.substring(0, currentFolder.lastIndexOf('/')) + '/../build'
  , file = 'file://' + args[1]
  , debugOutput = [debugFolder, 'debug_' + args[1].split('/').pop() ].join('/')
  ;

var resources = [];

// console.error somehow goes to stdout when node sees it. Use sys.stderr.write seems to be right
sys.stderr.write("Processing html " + file + "\n");
sys.stderr.write("Debug output -> " + debugOutput + "\n");


page.onResourceRequested = function(request) {
  resources.push(request.url);
};

page.viewportSize = { width: 1280, height: 800 };

page.open(file, function(status) {
  if ( status === "success" ) {
    var chars = page.evaluate(function() {
      var result = {}
        , idPattern = /^ad$/i;

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

