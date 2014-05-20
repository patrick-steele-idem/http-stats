window.showHttpStatsReport = function(data) {

    var steps = data.steps;

    function toFixed(num, decimal) {
        if (!num) {
            return 0;
        }

        return parseFloat(num.toFixed(decimal));
    }

    function buildReqPerSecondChart() {
        var xAxisCategories = [];

        var seriesData = [];

        steps.forEach(function(stepInfo) {
            var concurrency = stepInfo.concurrency;
            var stepStats = stepInfo.stats;
            xAxisCategories.push(concurrency);
            seriesData.push(toFixed(stepStats.requestsPerSecond.mean, 2));
        });

        return {
                chart: {
                    type: 'line'
                },
                title: {
                    text: 'Requests per Second'
                },
                xAxis: {
                    categories: xAxisCategories,
                    title: {
                        text: 'Concurrency'
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Requests per Second'
                    }
                },
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: false
                        },
                        enableMouseTracking: true
                    }
                },
                series: [
                    {
                        name: 'Requests per Second',
                        data: seriesData
                    }]
            };
    }

    function buildCPUChart() {
        var xAxisCategories = [];

        var chart = {
                chart: {
                    type: 'line'
                },
                title: {
                    text: 'CPU Usage'
                },
                xAxis: {
                    categories: xAxisCategories,
                    title: {
                        text: 'Concurrency'
                    }
                },
                yAxis: {
                    min: 0,
                    max: 100,
                    title: {
                        text: 'CPU Usage (%)'
                    }
                },
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: false
                        },
                        enableMouseTracking: true
                    }
                },
                series: []
            };

        var pidSeries = {};

        data.pids.forEach(function(pid) {
            var series = pidSeries[pid] = {
                name: 'pid: ' + pid,
                data: []
            };
            chart.series.push(series);
        });

        steps.forEach(function(stepInfo) {
            var concurrency = stepInfo.concurrency;
            var stepStats = stepInfo.stats;
            var usage = stepStats.usage;
            xAxisCategories.push(concurrency);
            usage.forEach(function(processUsage) {
                var pid = processUsage.pid;
                pidSeries[pid].data.push(processUsage.cpu ? toFixed(processUsage.cpu.mean, 2) : 0);
            });
            
        });

        return chart;
    }

    function buildMemoryChart() {
        var xAxisCategories = [];

        var chart = {
                chart: {
                    type: 'line'
                },
                title: {
                    text: 'Memory Usage'
                },
                xAxis: {
                    categories: xAxisCategories,
                    title: {
                        text: 'Concurrency'
                    }
                },
                yAxis: {
                    min: 0,
                    max: 100,
                    title: {
                        text: 'Memory Usage (MB)'
                    }
                },
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: false
                        },
                        enableMouseTracking: true
                    }
                },
                series: []
            };

        var pidSeries = {};

        data.pids.forEach(function(pid) {
            var series = pidSeries[pid] = {
                name: 'pid: ' + pid,
                data: []
            };
            chart.series.push(series);
        });

        steps.forEach(function(stepInfo) {
            var concurrency = stepInfo.concurrency;
            var stepStats = stepInfo.stats;
            var usage = stepStats.usage;
            xAxisCategories.push(concurrency);
            usage.forEach(function(processUsage) {
                var pid = processUsage.pid;
                pidSeries[pid].data.push(processUsage.memory ? toFixed(processUsage.memory.mean, 2) : 0);
            });
            
        });

        return chart;
    }

    function buildResponseTimeChart() {
        var xAxisCategories = [];

        var seriesDataMin = [];
        var seriesDataAvg = [];
        var seriesDataMax = [];

        steps.forEach(function(stepInfo) {
            var concurrency = stepInfo.concurrency;
            var stepStats = stepInfo.stats;
            xAxisCategories.push(concurrency);
            seriesDataMin.push(toFixed(stepStats.responseTime.min, 2));
            seriesDataAvg.push(toFixed(stepStats.responseTime.mean, 2));
            seriesDataMax.push(toFixed(stepStats.responseTime.max, 2));
        });

        return {
                chart: {
                    type: 'line'
                },
                title: {
                    text: 'Response Time'
                },
                xAxis: {
                    categories: xAxisCategories,
                    title: {
                        text: 'Concurrency'
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Response Time (ms)'
                    }
                },
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: false
                        },
                        enableMouseTracking: true
                    }
                },
                series: [
                    {
                        name: 'Min',
                        data: seriesDataMin
                    },
                    {
                        name: 'Average',
                        data: seriesDataAvg
                    },
                    {
                        name: 'Max',
                        data: seriesDataMax
                    }]
            };
    }

    $(function () {
        $('#reqPerSecContainer').highcharts(buildReqPerSecondChart());
        $('#responseTimeContainer').highcharts(buildResponseTimeChart());

        if (data.cpuAvailable) {
            $('#cpuContainer').highcharts(buildCPUChart());
        }

        if (data.memoryAvailable) {
            $('#memoryContainer').highcharts(buildMemoryChart());
        }
    });
};