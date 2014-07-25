var fs = require('fs')
    , _ = require('lodash')
    , util = require('./util')
    , args = process.argv.slice(2)
    , inputCssStr = args[0]
    , cssMetricsFile = __dirname + '/css_attrs.json'
    , cssDefault = require('./css_attrs_default').values()
    , dbFolder = __dirname + '/../db'
    ;

var cssMetrics = JSON.parse(fs.readFileSync(cssMetricsFile, 'utf8'));
var dbFile = [ dbFolder, locateDbFile(dbFolder) ].join('/');

console.log("db file " + dbFile);

var db = loadDb(dbFile);

var inputCssOpts = JSON.parse(inputCssStr);

console.log("input " + util.displayCssConfig(inputCssOpts));

var test = {
    "font-weight":  "normal",
    "font-size": "13px",
    "line-height": "1.4",
    "font-family": "Times New Roman",
    "width": "200px",
    "height": "60px"
};

console.log(match(inputCssOpts));

function match(cssProp) {
    var searchable = closestMetrics(cssProp);
    // console.log("Found closest config " + util.displayCssConfig(searchable));
    var found = _.find(db, function(opt) {
        return propMatched(opt, searchable);
    });
    if (_.isNull(found)) {
        answer = 'not found';
    } else {
        answer = found['max'];
    }

    return JSON.stringify([ answer ]);
}


function propMatched(one, two) {
    var keys = _.keys(cssDefault);
    return _.every(keys, function(key) {
        return one[key] === two[key];
    });
}

/**
 * Given a set of css property and value, return the closest css property that was pre-configured, so it can be used
 * later on to do search.
 * 
 * @param  {Object hash} cssProps [description]
 * @return {Object hash}          [description]
 */
function closestMetrics(cssProps) {
    var obj = {};
    _.each(cssProps, function(value, key) {
        var configValues = cssMetrics[key];
        // console.log("::closestMetrics key " + key + ", " + configValues);

        if (!_.isNull(configValues)) {
            obj[key] = bestValue(key, configValues, value);
        }
        return obj;
    }, {});
    // Filling missing css properties
    return _.merge(cssDefault, obj);
}

/**
 * Give a specific css property and value, find the best match that was pre-configured.
 * 
 * @param  {[type]} name      [description]
 * @param  {[type]} values    [description]
 * @param  {[type]} realValue [description]
 * @return {[type]}           [description]
 */
function bestValue(name, values, realValue) {
    var name = name.toLowerCase();
    var best = null;

    // clean up values like 12px to 12
    var vals = _.map(values, function(v) {
        return cleanValue(v)[0];
    });
    var clean = cleanValue(realValue);
    // suffix could be "px" etc.
    var rVal = clean[0], suffix = clean[1];

    switch(name) {
        case "font-variant":
            best = bestCategoricalValue(vals, rVal);
            break;
        case "font-weight":
            best = bestCategoricalValue(vals, rVal);
            break;
        case "font-size":
            best = bestNumericValue(vals, rVal);
            break;
        case "line-height":
            best = bestNumericValue(vals, rVal);
            break;
        case "font-family":
            best = bestCategoricalValue(vals, rVal);
            break;
        case "width":
            best = bestNumericValue(vals, rVal);
            break;
        case "height":
            best = bestNumericValue(vals, rVal);
            break;
    }
    if (_.isNull(best)) {
        // if somehow there's no pre-configured value found, return the default
        best = cssDefault[name];
    } else {
        best = best + suffix;
    }

    return best;
}

/**
 * [cleanValue description]
 * @param  {String} value [description] E.g. "18px", "bold", "1.0"
 * @return {[ String or Float, css value suffix] }   e.g. [ 18, 'px']
 */
function cleanValue(value) {
    if (/^\d/.test(value)) {
        return [ parseFloat(value.replace(/[^\d.]*$/, '')), value.replace(/^[\d.]*/, '') ];
    } else {
        return [ value, "" ];
    }
}

function bestCategoricalValue(values, realValue) {
    return _.find(values, function(v) {
        return v === realValue;
    });
}

/**
 * [bestNumericValue description]
 * @param  {[type]} values    Pre-ordered array of number type
 * @param  {[type]} realValue [description]
 * @return {[type]}           [description]
 */
function bestNumericValue(values, realValue) {
    var found = values[0];
    for (var i=1; i<values.length; i++) {
        if (values[i] > realValue) {
            break;
        } else {
            found = values[i];
        }
    }

    middle = (values[i] + values[i-1]) / 2;
    if (middle < realValue) {
        found = values[i];
    }
 
    return found;
}

function locateDbFile(dir) {
    var files = fs.readdirSync(dir);
    _.sortBy(files, function(f) {
        return f;
    });
    return files[files.length-1];
}

function loadDb(file) {
    var content = fs.readFileSync(file, 'utf8');
    return  _.reduce(content.split("\n"), function(arr, line) {
        try {
            arr.push(JSON.parse(line.trim()))
        } catch (e) {};
        return arr;
    }, []);
}

exports.guess = closestMetrics;
