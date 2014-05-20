var fs = require('fs');
var jsonminify = require("jsonminify");
var httpStats = require('../');
var shortstop = require('shortstop');
var nodePath = require('path');

var args = require('raptor-args')
    .createParser({
        '--help': {
            type: 'string',
            description: 'Show this help message'
        },
        '--config': {
            type: 'string',
            description: 'Configuration for collection and reporting'
        },
        '--url -u': {
            type: 'string',
            description: 'The URL to request'
        },
        '--begin-concurrency --concurrency -c': {
            type: 'integer',
            description: 'Concurrency for first step'
        },
        '--end-concurrency': {
            type: 'integer',
            description: 'Concurrency for the final step (increased linearly)'
        },
        '--step-requests --requests -n': {
            type: 'integer',
            description: 'Number of requests to make for each step'
        },
        '--spawn': {
            type: 'string[]',
            description: 'Process to spawn (program, followed by args)'
        },
        '--delay': {
            type: 'integer',
            description: 'The delay between each step'
        },
        '--report-dir': {
            type: 'string',
            description: 'Output directory for the report'
        },
        '--pids --pid -p': {
            type: 'integer[]',
            description: 'The process IDs to monitor for memory and CPU usage'
        }
    })
    .usage('Usage: $0 [options]')
    .example(
        'Config file example',
        '$0 --config my-config.json')
    .validate(function(result) {
        if (result.help) {
            this.printUsage();
            process.exit(0);
        }

        if (!result.config && !result.url) {
            this.printUsage();
            console.log('--config is required');
            process.exit(1);
        }
    })
    .onError(function(err) {
        this.printUsage();
        console.error(err);
        process.exit(1);
    })
    .parse();

var configFile = args.config;
var config;
var configDir;

function shortstopPathResolver(value) {
    return nodePath.resolve(configDir, value);
}

function measure(config) {
    httpStats.measure(config, function(err) {
            if (err) {
                console.error('An error occurred: ' + (err.stack || err));
                return;
            }
        })
        .on('stepBegin', function(stepInfo) {
            console.log('Started step [concurrency=' + stepInfo.concurrency + ']');
        })
        .on('stepEnd', function(stepInfo) {
            console.log('Completed step [concurrency=' + stepInfo.concurrency + ']. Stats:\n' + JSON.stringify(stepInfo.stats, null, 4));
        })
        .on('startServer', function(info) {
            console.log('Starting server [command=' + info.command + ']');
        })
        .on('serverReady', function(info) {
            console.log('Server started [pid=' + info.pid + ']');
        })
        .on('serverStopped', function(info) {
            console.log('Server stopped');
        })
        .on('end', function(info) {
            console.log('Done collecting data!');
            // console.log('Done. Results:\n' + JSON.stringify(info.stats, null, 4));

            if (config.report) {
                var outputDir = config.report.outputDir || (config.report.outputDir = process.cwd());
                httpStats.generateReport(info, config.report, function() {
                    console.log('Report saved to ' + (nodePath.join(outputDir, 'index.html')));
                });
            }
        }); 
}

if (configFile) {
    configDir = nodePath.dirname(configFile);
    config = JSON.parse(jsonminify(fs.readFileSync(configFile, 'utf8')));
    var resolver = shortstop.create();
    resolver.use('path', shortstopPathResolver);
    resolver.resolve(config, function(err, config) {
        if (err) {
            console.error('Error reading config file. Exception: ', err);
            return;
        }

        measure(config);
    });
} else {
    config = {
        url: args.url,
        beginConcurrency: args.beginConcurrency,
        endConcurrency: args.endConcurrency,
        stepRequests: args.stepRequests,
        spawn: args.spawn,
        delay: args.delay,
        pids: args.pids
    };

    if (args.reportDir) {
        config.report = {
            outputDir: nodePath.resolve(process.cwd(), args.reportDir)
        };
    }

    console.log('Config: ' + JSON.stringify(config, null, 4));

    measure(config);
}

