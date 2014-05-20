var http = require('http');
var https = require('https');
var url = require('url');


var pending = 0;

exports.createGet = function createGet(options, targetUrl) {
    var getFunc = http.get;
    var parsedUrl = url.parse(targetUrl);
    var timeout = options.timeout;

    if (parsedUrl.port == 443 || (parsedUrl.protocol && parsedUrl.protocol.indexOf('https') > -1)){
        getFunc = https.get;
    }

    

    return function httpGet(callback) {
        var completed = false;

        function done(err, res) {
            if (completed) {
                return;
            }

            completed = true;
            pending--;
            
            // if (res) {
            //     console.log('Completed request. statusCode=' + res.statusCode + ': Pending: '+ pending);    
            // } else if (err) {
            //     console.log('Failed request. ' + err + ': Pending: '+ pending);    
            // }
            
            if (timeoutId) {
                clearTimeout(timeoutId);    
            }
            
            callback(err, res);
        }
        var request = getFunc(
            targetUrl,
            function(res) {
                res.on('data', function(){});
                res.on('end', function(){
                    done(null, res);
                });
            })
            .on('error', function(e) {
                done(e);
            });

        

        if (timeout) {
            var timeoutId = setTimeout(function() {
                done(new Error('Request to "' + targetUrl + '" timed out after ' + timeout + 'ms'));
            }, timeout);
        } 

        pending++;
        // console.log('Started request. pending: ' + pending);

        return request;
    };
};