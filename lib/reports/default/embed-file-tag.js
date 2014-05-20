var fs = require('fs');
var nodePath = require('path');

module.exports = function render(input, context) {
    var asyncContext = context.beginAsync();
    var path = input.path;
    fs.readFile(path, 'utf8', function(err, src) {
        if (err) {
            asyncContext.error(err);
            return;
        }

        if (nodePath.extname(path) === '.js') {
            asyncContext.end('<script type="text/javascript">' + src + '</script>');
        } else if (nodePath.extname(path) === '.css') {
            asyncContext.end('<style type="text/css">' + src + '</style>');
        } else {
            asyncContext.error('Unsupported file path: ' + path);
        }
    });
};