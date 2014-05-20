http-stats
==========
Simple tool for load testing an HTTP server that allows for increasing load to be applied over time. This module provides support for collecting various statistics, including requests per second, response time, CPU and memory usage. Resulting statistics can be saved to disk as a JSON file or written to an HTML report with graphs.

# Installation

To install the command line tool:

```bash
npm install http-stats --global
```

Alternatively, the JavaScript module can be installed into a project:

```bash
npm install http-stats --save
```


# Usage

## Command Line Interface

```bash
http-stats --url http://localhost:8080 -n 100 --begin-concurrency 1 --end-concurrency 50 --pids 1234 1235 --report-dir report
```

Alternatively, all of the configuration can be put into a configuration file:

```bash
http-stats --config my-config.json
```

Example contents of `my-config.json`:

```json
{
    "url": "http://localhost:8080",
    "beginConcurrency": 1,
    "endConcurrency": 50,
    "stepRequests": 100,
    "pids": [1234, 1235],
    "report": {
        "outputDir": "path:./report"
    }
}
```

## JavaScript API

Alternatively, the JavaScript API can be used to collect statistics as shown in the following sample code:

```javascript
var httpStats = require('http-stats');

httpStats.measure({
         url: 'http://localhost:8080',
         beginConcurrency: 1,
         endConcurrency: 50,
         stepRequests: 100,
         pids: [1234, 1235],
         report: {
             outputDir: require('path').join(__dirname, 'report')
         }
    }, function(err, results) {
        // Do something with the resulting data
    });
```

## Sample Statistics

```json
{
    "cpuAvailable": true,
    "memoryAvailable": true,
    "stats": [
        {
            "concurrency": 1,
            "stats": {
                "responseTime": {
                    "min": 11.562785029411316,
                    "max": 19.471349954605103,
                    "sum": 1358.6313557624817,
                    "variance": 2.64784231895231,
                    "mean": 13.586313557624816,
                    "stddev": 1.627219198188219,
                    "count": 100,
                    "median": 13.028658986091614,
                    "p75": 14.24703973531723,
                    "p95": 16.65775092244148,
                    "p99": 19.463981754779812,
                    "p999": 19.471349954605103
                },
                "requestsPerSecond": {
                    "mean": 73.32546082534017,
                    "count": 100,
                    "currentRate": 73.32433734563027,
                    "1MinuteRate": 0,
                    "5MinuteRate": 0,
                    "15MinuteRate": 0
                },
                "usage": [
                    {
                        "pid": "33062",
                        "cpu": {
                            "min": 0,
                            "max": 0.5,
                            "sum": 11.199999999999989,
                            "variance": 0.022248995983935746,
                            "mean": 0.1333333333333332,
                            "stddev": 0.14916097339430226,
                            "count": 84,
                            "median": 0.1,
                            "p75": 0.2,
                            "p95": 0.5,
                            "p99": 0.5,
                            "p999": 0.5
                        },
                        "memory": {
                            "min": 68.20703125,
                            "max": 68.20703125,
                            "sum": 5797.59765625,
                            "variance": 0,
                            "mean": 68.20703125,
                            "stddev": 0,
                            "count": 85,
                            "median": 68.20703125,
                            "p75": 68.20703125,
                            "p95": 68.20703125,
                            "p99": 68.20703125,
                            "p999": 68.20703125
                        }
                    }
                ]
            }
        },
        {
            "concurrency": 2,
            "stats": {
                "responseTime": {
                    "min": 11.659276962280273,
                    "max": 21.81683897972107,
                    "sum": 1383.8951340913773,
                    "variance": 3.2013560905275846,
                    "mean": 13.97873872819573,
                    "stddev": 1.7892333806766474,
                    "count": 99,
                    "median": 13.467664003372192,
                    "p75": 14.689211010932922,
                    "p95": 17.55275595188141,
                    "p99": 21.81683897972107,
                    "p999": 21.81683897972107
                },
                "requestsPerSecond": {
                    "mean": 141.74595662204692,
                    "count": 99,
                    "currentRate": 141.73979759785095,
                    "1MinuteRate": 0,
                    "5MinuteRate": 0,
                    "15MinuteRate": 0
                },
                "usage": [
                    {
                        "pid": "33062",
                        "cpu": {
                            "min": 0,
                            "max": 0.3,
                            "sum": 5.9,
                            "variance": 0.012024390243902443,
                            "mean": 0.14390243902439026,
                            "stddev": 0.1096557807135695,
                            "count": 41,
                            "median": 0.2,
                            "p75": 0.2,
                            "p95": 0.3,
                            "p99": 0.3,
                            "p999": 0.3
                        },
                        "memory": {
                            "min": 68.20703125,
                            "max": 68.20703125,
                            "sum": 2864.6953125,
                            "variance": 0,
                            "mean": 68.20703125,
                            "stddev": 0,
                            "count": 42,
                            "median": 68.20703125,
                            "p75": 68.20703125,
                            "p95": 68.20703125,
                            "p99": 68.20703125,
                            "p999": 68.20703125
                        }
                    }
                ]
            }
        },
        ...,
        {
            "concurrency": 10,
            "stats": {
                "responseTime": {
                    "min": 11.175518989562988,
                    "max": 29.486907958984375,
                    "sum": 1753.7954921722412,
                    "variance": 21.318200618972394,
                    "mean": 19.272477935958694,
                    "stddev": 4.617163698524495,
                    "count": 91,
                    "median": 19.485509037971497,
                    "p75": 21.68475103378296,
                    "p95": 28.69777555465698,
                    "p99": 29.486907958984375,
                    "p999": 29.486907958984375
                },
                "requestsPerSecond": {
                    "mean": 504.8386172505691,
                    "count": 91,
                    "currentRate": 504.8419813195869,
                    "1MinuteRate": 0,
                    "5MinuteRate": 0,
                    "15MinuteRate": 0
                },
                "usage": [
                    {
                        "pid": "33062",
                        "cpu": {
                            "min": 0,
                            "max": 0.4,
                            "sum": 2.4,
                            "variance": 0.022857142857142864,
                            "mean": 0.34285714285714286,
                            "stddev": 0.1511857892036909,
                            "count": 7,
                            "median": 0.4,
                            "p75": 0.4,
                            "p95": 0.4,
                            "p99": 0.4,
                            "p999": 0.4
                        },
                        "memory": {
                            "min": 68.2109375,
                            "max": 68.2109375,
                            "sum": 545.6875,
                            "variance": 0,
                            "mean": 68.2109375,
                            "stddev": 0,
                            "count": 8,
                            "median": 68.2109375,
                            "p75": 68.2109375,
                            "p95": 68.2109375,
                            "p99": 68.2109375,
                            "p999": 68.2109375
                        }
                    }
                ]
            }
        }
    ],
    "url": "http://localhost:9900",
    "pids": [
        33062
    ],
    "options": {
        "beginConcurrency": 1,
        "endConcurrency": 10,
        "stepRequests": 100,
        "concurrencyIncrement": 1,
        "delay": 2000
    }
}
```

# TODO

* Add documentation for all supported configuration options
* Integrate support for [pm2](https://github.com/unitech/pm2) to query for process IDs using the [pm2-interface](https://github.com/Unitech/pm2-interface) module.
* Provide ability to compare differences between statistics gathered at different times (to detect performance decreases/increases)
* Improve tests
* Provide to sample report from this documentation

# Maintainers

* Patrick Steele-Idem ([Github: @patrick-steele-idem](http://github.com/patrick-steele-idem)) ([Twitter: @psteeleidem](http://twitter.com/psteeleidem))

# License

[MIT](http://opensource.org/licenses/MIT)

# Credits

* The reports generated by this tool use [Highcharts](http://www.highcharts.com/) to render the graphs.
* The [measured](https://www.npmjs.org/package/measured) module is used to collect statistics.