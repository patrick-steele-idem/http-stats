var spawn = require('child_process').spawn;
var util = require('./util');
var EventEmitter = require('events').EventEmitter;

module.exports = function launchServer(options, callback) {

    var pid;
    var url = options.url;
    var pollDelay = options.pollDelay || 100;
    var maxAttempts = options.maxAttempts || 30;
    var requestTimeout = options.requestTimeout == null ? 5000 : options.requestTimeout;
    var httpGet = util.createGet({timeout: requestTimeout}, url);
    var attemptCount = 0;
    var processInfo;

    function waitForServer() {
        setTimeout(function() {
            attemptCount++;

            httpGet(function(err, res) {
                if (err || res.statusCode !== 200) {
                    if (attemptCount === maxAttempts) {
                        processInfo.kill();
                        callback(err || new Error('Server never responded successfully'));
                    } else {
                        waitForServer();
                    }
                    return;
                }

                setTimeout(function() {
                    callback(null, processInfo);    
                }, 1000);
                
            });
        }, pollDelay);
    }

    var emitter = new EventEmitter();

    var spawnArgs = options.spawn;
    if (spawnArgs) {
        spawnArgs = [].concat(spawnArgs);
        var command = spawnArgs.shift();
        processInfo = spawn(command, spawnArgs, {
            env: process.env,
            stdio: 'inherit'
        });
        pid = processInfo.pid;
        waitForServer();

        processInfo.on('exit', function(code, signal) {
            emitter.emit('exit', code, signal);
        });
    } else {
        callback();
    }

    return emitter;
};