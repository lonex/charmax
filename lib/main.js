var args = process.argv.slice(2);

var fs = require('fs'),
    shell = require('child_process').execFile,
    jade = require('jade'),
    _ = require('lodash'),
    util = require('./util'),
    phantomjs = require('phantomjs').path,
    phantomjsScript = __dirname + '/inline_render.js',
    adTemplate = __dirname + '/../templates/ad.jade',
    cssAttrFile = __dirname + '/css_attrs.small.json';

var resp;

var options = {
    pretty: true
    // , debug: true
    // , compileDebug: true
};

console.log("phantomjs path " + phantomjs);
console.log("args " + args);
console.log("adTemplate " + adTemplate);

var defaultCss = {
    "font-variant": "normal",
    "font-weight": "normal",
    "font-size": "12px",
    "line-weight": "1.2",
    "font-family": "Times New Roman",
    "width": "200px",
    "height": "60px"
};

var css = JSON.parse(fs.readFileSync(cssAttrFile, 'utf8'));
var cssProperties = compileCss(css);
var products = util.cartesianProduct.apply(this, cssProperties);

//
// main flow
// 
render();


function render() {
    var maxMap = {};

    _.each(products, function(cssConfig) {
        var cssProp = _.merge(defaultCss, _.reduce(cssConfig, function(opts, p) {
            return opts = _.merge(opts, p);
        }, {}));
        jade.renderFile(adTemplate, _.merge(options, {
             css: cssProp
        }), function(err, html) {
            if (err) throw err;

            var outputHtml = buildFileName(cssProp);
            fs.writeFileSync(outputHtml, html);

            shell(phantomjs, [phantomjsScript, outputHtml], [], function(err, stdout, stderr) {
                console.log("processing " + outputHtml);

                if (err) throw err;

                try {
                    resp = JSON.parse(stdout);
                    console.log("resp string " + stdout);
                    maxMap[cssProp] = resp['ad'];
                } catch (err) {
                    log('Error');
                    error(err);
                }

                console.log("= " + _.keys(maxMap));
                console.log("= " + _.values(maxMap));

            });
        });
    });
}

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
            value[key] = v;
            m[key] = m[key].concat([value]);
        });
    });
    return _.values(m);
}

function buildFileName(cssProp) {

    var parts = _.reduce(cssProp, function(fName, value, key) {
        value = value.toLowerCase().replace(/\s+/g,'');
        key = key.toLowerCase();
        switch(key) {
            case "font-variant":
                fName.push("fv.".concat(value));
                break;
            case "font-weight":
                fName.push("fw.".concat(value));
                break;
            case "font-size":
                fName.push("fs.".concat(value));
                break;
            case "line-weight":
                fName.push("lw.".concat(value));
                break;
            case "font-family":
                fName.push("ff.".concat(value));
                break;
            case "width":
                fName.push("w.".concat(value));
                break;
            case "height":
                fName.push("h.".concat(value));
                break;
        }
        return fName;
    },[]);

    return __dirname + "/../build/" + parts.join("_") + '.html';
}

function log(message) {
    process.stdout.write(message + '\n');
}

function error(err) {
    process.stderr.write(err);
}