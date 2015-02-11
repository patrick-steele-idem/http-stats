var fs = require('fs');
var nodePath = require('path');
var template = require('marko').load(require.resolve('./template.marko'));
var async = require('async');

module.exports = function defaultReport(data, options, callback) {
    var outputDir = options.outputDir || process.cwd();

    // console.log('DATA: ', JSON.stringify(data, null, 4));

    function writeHtml(callback) {
        var title = options.title || 'Report';



        var htmlOut = fs.createWriteStream(nodePath.join(outputDir, 'index.html'), 'utf8');
        template.stream({
                showCPU: data.cpuAvailable === true,
                showMemory: data.memoryAvailable === true,
                results: JSON.stringify(data, null, 4),
                title: title
            })
            .pipe(htmlOut)
            .on('error', callback)
            .on('close', function() {
                callback();
            });
    }

    // function copyFileTask(path, outputDir) {
    //     return function(callback) {
    //         var inStream = fs.createReadStream(path);
    //         var outputFile = nodePath.join(outputDir, nodePath.basename(path));
    //         var outStream = fs.createWriteStream(outputFile);
    //         inStream.pipe(outStream)
    //             .on('error', callback)
    //             .on('close', function() {
    //                 callback();
    //             });
    //     };
    // }

    // var highchartsDir = nodePath.join(__dirname, '../../../third-party/highcharts');
    // var jqueryDir = nodePath.join(__dirname, '../../../node_modules/jquery');

    async.parallel([
            writeHtml
            // copyFileTask(nodePath.join(jqueryDir, 'dist/jquery.min.js'), outputDir),
            // copyFileTask(nodePath.join(highchartsDir, 'js/highcharts.js'), outputDir),
            // copyFileTask(nodePath.join(highchartsDir, 'js/modules/exporting.js'), outputDir),
            // copyFileTask(nodePath.join(__dirname, 'http-stats-report-client.js'), outputDir)
        ],
        callback);
};