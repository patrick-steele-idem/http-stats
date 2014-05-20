module.exports = function create(__helpers) {
  var empty = __helpers.e,
      notEmpty = __helpers.ne,
      escapeXml = __helpers.x,
      embed_file_tag = require("./embed-file-tag");

  return function render(data, context) {
    context.w('<!doctype html> <html lang="en"><head><meta charset="UTF-8"><title>' +
      escapeXml(data.title) +
      ' | http-stats</title></head><body><div id="reqPerSecContainer" style="min-width: 310px; height: 300px; margin: 0 auto"></div><div id="responseTimeContainer" style="min-width: 310px; height: 300px; margin: 0 auto"></div>');

    if (data.showCPU) {
      context.w('<div id="cpuContainer" style="min-width: 310px; height: 300px; margin: 0 auto"></div>');
    }

    if (data.showMemory) {
      context.w('<div id="memoryContainer" style="min-width: 310px; height: 300px; margin: 0 auto"></div>');
    }
    __helpers.t(context, 
      embed_file_tag,
      {
        "path": require.resolve("../../../node_modules/jquery/dist/jquery.min.js")
      });
    __helpers.t(context, 
      embed_file_tag,
      {
        "path": require.resolve("../../../third-party/highcharts/js/highcharts.js")
      });
    __helpers.t(context, 
      embed_file_tag,
      {
        "path": require.resolve("../../../third-party/highcharts/js/modules/exporting.js")
      });
    __helpers.t(context, 
      embed_file_tag,
      {
        "path": require.resolve("./http-stats-report-client.js")
      });

    context.w('<script type="text/javascript">\n    window.showHttpStatsReport(' +
      (data.results) +
      ');\n    </script></body></html>');
  };
}