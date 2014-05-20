var EventEmitter = require('events').EventEmitter;
var measureStep = require('./measureStep');
var launchServer = require('./launchServer');
var ok = require('assert').ok;

module.exports = function measure(options, callback) {

    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    ok(typeof callback === 'function', 'Callback required');

    options = options || {};

    var url = options.url;
    var beginConcurrency = options.beginConcurrency || options.concurrency || 1;
    var endConcurrency = options.endConcurrency || 10;
    var stepRequests = options.stepRequests || 100;
    var concurrencyIncrement = options.concurrencyIncrement || 1;
    var delay = options.delay || 2000;
    var spawn = options.spawn;
    var concurrencyIncrementInt = null;

    if (typeof concurrencyIncrement === 'number') {
        concurrencyIncrementInt = concurrencyIncrement;
        concurrencyIncrement = function(concurrency) {
            return concurrency + concurrencyIncrementInt;
        };
    }

    var processInfo;
    var emitter = new EventEmitter();

    var concurrency = beginConcurrency;

    var completed = false;

    var stepResults = [];

    var measureStepHandle = null;

    function done(err) {
        if (completed) {
            return;
        }

        completed = true;

        if (processInfo) {
            processInfo.kill();
        }

        if (err) {
            callback(err);
            return;
        }
        
        var pids = options.pids || options.pid;
        if (pids == null) {
            pids = [];
        } else if (!Array.isArray(pids)) {
            pids = [pids];
        }

        var results = {
            cpuAvailable: pids.length !== 0,
            memoryAvailable: pids.length !== 0,
            stats: stepResults,
            url: url,
            pids: pids,
            options: {
                beginConcurrency: beginConcurrency,
                endConcurrency: endConcurrency,
                stepRequests: stepRequests,
                concurrencyIncrement: typeof concurrencyIncrementInt === 'number' ? concurrencyIncrementInt : null,
                delay: delay
            }
        };
        
        emitter.emit('end', results);

        callback(null, results);
    }


    function step() {
        if (completed) {
            return;
        }

        emitter.emit('stepBegin', {
            concurrency: concurrency
        });
        measureStepHandle = measureStep(
            {
                url: url,
                maxRequests: stepRequests,
                concurrency: concurrency,
                pids: options.pids || options.pid
            },
            function(err, results) {
                measureStepHandle = null;

                if (err) {
                    return callback(err);
                }

                emitter.emit('stepEnd', {
                    stats: results,
                    concurrency: concurrency
                });

                stepResults.push({
                    concurrency: concurrency,
                    stats: results
                });

                concurrency = concurrencyIncrement(concurrency);
                if (concurrency > endConcurrency) {

                    done();
                } else {
                    setTimeout(step, delay);
                }
            });
    }

    if (spawn) {
        emitter.emit('startServer', {
                    command: spawn.join(' ')
                });

        launchServer(options, function(err, _processInfo) {
                if (err || completed) {
                    return done(err);
                }

                emitter.emit('serverReady', {
                        pid: _processInfo.pid,
                        command: spawn.join(' ')
                    });

                processInfo = _processInfo;

                options.pids = [processInfo.pid];

                step();
            })
            .on('exit', function(code, signal) {
                emitter.emit('serverStopped', {
                    pid: processInfo ? processInfo.pid : null
                });

                if (code !== 0) {
                    done(new Error('Process ended unexpectedly with code ' + code));
                    if (measureStepHandle) {
                        measureStepHandle.abort();
                    }
                }
            });
    } else {
        step();    
    }
    
    return emitter;
};