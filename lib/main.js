
var args = process.argv.slice(2);

var fs               = require('fs')
  , shell            = require('child_process').execFile
  , jade             = require('jade')
  , _                = require('lodash')
  , util             = require('./util')
  , phantomjs        = require('phantomjs').path
  , phantomjsScript  = __dirname + '/inline_render.js'
  , adTemplate       = __dirname + '/../templates/ad.jade'
  , outputHtml       = __dirname + '/../build/ad.html'
  , cssAttrFile          = __dirname + '/css_attrs.small.json'
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

var css = JSON.parse(fs.readFileSync(cssAttrFile, 'utf8'));
var cssProperties = compileCss(css);
// var products = util.cartesianProduct.apply(this, cssProperties);
var products = [
 [ { 'font-variant': 'normal' }, { 'font-size': '12px' } ]
];

// console.log(products);

render();

/**
 * [compileCss description]
 * @param  {[type]} css [description]
 * @return {[type]}     [description]
 *         e.g. 
 *         [ [ { 'font-variant': 'normal' }, { 'font-size': '12px' } ],
 *           [ { 'font-variant': 'normal' }, { 'font-size': '16px' } ],
 *           [ { 'font-variant': 'small-caps' }, { 'font-size': '12px' } ],
 *           [ { 'font-variant': 'small-caps' }, { 'font-size': '16px' } ] ]
 */
function compileCss(css) {
  console.log('keys: ' + _.keys(css));
  var m = {};
  _.each(css, function(value, key) {
    _.each(value, function(v) {
      if (_.isEmpty(m[key])) {
        m[key] = [];
      }
      value = {};
      if (key === 'font-family') {
        value[key] = "\"" + v + "\""; //key.concat(":\"").concat(v).concat("\"");
      } else {
        value[key] = v; // key.concat(":").concat(v);
      }

      m[key] = m[key].concat([ value ]);
    });
  });
  return _.values(m);
}

function render() {
  // 
  _.each(products, function(cssConfig) {  
    var cssProp = _.reduce(cssConfig, function(opts, p) {
                    return opts = _.merge(opts, p);
                  }, {});
    jade.renderFile(adTemplate, _.merge(options, {css: cssProp}), function(err, html) {
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
  });
}

function log(message) {
    process.stdout.write(message + '\n');
}

function error(err) {
    process.stderr.write(err);
}
