var nodePath = require('path');
var mkdirp = require('mkdirp');

module.exports = function generateReport(data, options, callback) {
    var reportType = options.type || 'default';
    var reportModule = require(nodePath.join(__dirname, 'reports', reportType));
    options.outputDir = options.outputDir || process.cwd();
    mkdirp(options.outputDir, function(err) {
        if (err) {
            return callback(err);
        }

        reportModule(data, options, callback);
    });
    
};