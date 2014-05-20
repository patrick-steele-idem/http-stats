var measured = require('measured');
var EventEmitter = require('events').EventEmitter;
var usage = require('usage');
var util = require('./util');

module.exports = function measure(options, callback) {

    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    options = options || {};

    // Read options:
    var targetUrl = options.url;
    var concurrency = options.concurrency || 1;
    var maxRequests = options.maxRequests || 1;
    var timeLimit = options.timeLimit || -1;
    var usagePollInterval = options.usagePollInterval || 10;
    var requestTimeout = options.requestTimeout == null ? 5000 : options.requestTimeout;
    var pids = options.pids || options.pid;
    if (pids && !Array.isArray(pids)) {
        pids = [pids];
    }

    if (pids && pids.length === 0) {
        pids = null;
    }
    // -------------

    require('http').globalAgent.maxSockets = require('https').globalAgent.maxSockets = concurrency+5;

    var httpGet = util.createGet({timeout: requestTimeout}, targetUrl);
    var emitter = new EventEmitter();
    var stats = measured.createCollection();
    
    var startedRequestCount = 0;
    var completedRequestCount = 0;
    var timeLimitExceeded = false;
    var completed = false;
    var statsCompleted = false;
    var results = {};

    var responseTime = stats.timer('responseTime');
    
    var usageStats = {};

    if (pids) {
        pids.forEach(function(pid) {
            usageStats[pid] = {
                cpu: stats.histogram(pid + ':cpu'),
                memory: stats.histogram(pid + ':memory')
            };
        });
    }

    function done(err) {

        if (completed) {
            return;
        }

        completed = true;

        completeStats();

        if (err) {
            callback(err);
            return;
        }

        
        emitter.emit('end', results);

        callback(null, results);
    }

    function completeStats() {
        if (statsCompleted) {
            return;
        }

        statsCompleted = true;

        stats.end();

        var rawStats = stats.toJSON();
        
        results.responseTime = rawStats.responseTime.histogram;
        results.requestsPerSecond = rawStats.responseTime.meter;
        if (pids) {
            results.usage = Object.keys(usageStats).map(function(pid) {
                return {
                    pid: pid,
                    cpu: rawStats[pid + ':cpu'],
                    memory: rawStats[pid + ':memory']
                };
            });
        }

        responseTime = null;
    }

    var usageOptions = { keepHistory: true };

    var firstCPUUpdate = true;

    function updateUsage(pid) {
        if (completed || statsCompleted) {
            return;
        }

        usage.lookup(pid, usageOptions, function(err, result) {
            if (err || completed || statsCompleted) {
                return;
            }

            var cpu = usageStats[pid].cpu;
            var memory = usageStats[pid].memory;

            var memoryBytes = result.memory;

            if (memoryBytes) {
                memory.update(memoryBytes / (1024 * 1024));    
            }

            if (firstCPUUpdate) {
                // Ignore the first CPU usage report since it may lack history
                // to give us an accurate report on Linux. I'm not sure
                // if this is completely necessary.
                firstCPUUpdate = false;
            } else {
                cpu.update(result.cpu);    
            }

            if (!completed) {
                setTimeout(updateUsage.bind(this, pid), usagePollInterval);
            }
        });
    }



    function makeRequest() {
        startedRequestCount++;
        
        emitter.emit('beginRequest', {
                startedRequestCount: startedRequestCount,
                completedRequestCount: completedRequestCount
            }); 

        var timer = responseTime.start();

        httpGet(function(err) {
            if (err) {
                done(err);
                return;
            }

            timer.end();

            emitter.emit('requestCompleted', {
                    maxRequests: maxRequests,
                    completedRequestCount: completedRequestCount
                });            

            completedRequestCount++;

            // console.log('Completed request for step: ' + completedRequestCount + ' [concurrency=' + concurrency + ']');

            if (err) {
                return done(err);
            }

            if (timeLimitExceeded) {
                
            } else if (startedRequestCount === maxRequests) {
                // Stop collecting stats as soon we stop making more requests
                // to avoid collecting stats during diminished concurrency
                completeStats();
            } else {
                makeRequest();
            }

            if (completedRequestCount === maxRequests || (timeLimitExceeded && completedRequestCount === startedRequestCount)) {
                done();
            }
        });
    }

    // Start the round of requests
    for (var i=0; i<concurrency; i++) {
        makeRequest();
    }

    if (pids) {
        pids.forEach(function(pid) {
            setTimeout(updateUsage.bind(this, pid), usagePollInterval);    
        });
    }

    if (timeLimit > 0) {
        setTimeout(function() {
            completeStats();
        }, timeLimit);
    }

    emitter.abort = function(err) {
        done(err || new Error('Aborted'));
    };

    return emitter;
};