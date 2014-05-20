'use strict';
var chai = require('chai');
chai.Assertion.includeStack = true;
require('chai').should();
var expect = require('chai').expect;
var httpStats  = require('../');
var express = require('express');
var app = express();
var port = 9991;
var http = require('http');
var server;
var nodePath = require('path');

describe('http-stats' , function() {
    before(function(done) {

        app.get('/', function(req, res) {
            setTimeout(function() {
                res.send({hello: 'world'});
            }, 10);
        });

        server = http.createServer(app);
        server.listen(port, done);
    });

    after(function(done) {
        server.close();
        done();
    });

    beforeEach(function(done) {
        done();
    });

    it('should measure stats correctly for variable settings', function(done) {
        this.timeout(0);

        httpStats.measure(
            {
                url: 'http://localhost:' + port,
                concurrency: 5,
                beginConcurrency: 1,
                endConcurrency: 3,
                stepRequests: 10,
                concurrencyIncrement: 1
            },
            function(err, results) {
                if (err) {
                    return done(err);
                }

                // console.log('results: ', JSON.stringify(results, null, 4));

                expect(results && typeof results === 'object').to.equal(true);
                done();
            });
    });

    it('should measure stats correctly for a spawned server', function(done) {
        this.timeout(0);

        httpStats.measure(
            {
                url: 'http://localhost:9992',
                spawn: ['node', nodePath.join(__dirname, 'test-server.js')],
                beginConcurrency: 1,
                endConcurrency: 3,
                stepRequests: 10,
                concurrencyIncrement: 1
            },
            function(err, results) {
                if (err) {
                    return done(err);
                }

                // console.log('results: ', JSON.stringify(results, null, 4));

                expect(results && typeof results === 'object').to.equal(true);
                expect(results.steps[0].stats.usage.length).to.equal(1);
                done();
            });
    });

    it('should generate a report correctly', function(done) {
        this.timeout(0);

        httpStats.measure(
            {
                url: 'http://localhost:' + port,
                spawn: ['node', nodePath.join(__dirname, 'test-server.js')],
                concurrency: 5,
                beginConcurrency: 1,
                endConcurrency: 3,
                stepRequests: 10,
                concurrencyIncrement: 1
            },
            function(err, results) {
                if (err) {
                    return done(err);
                }

                // console.log('results: ', JSON.stringify(results, null, 4));

                httpStats.generateReport(
                    results,
                    {
                        outputDir: nodePath.join(__dirname, 'build/report01'),
                        type: 'default'
                    },
                    function(err) {
                        if (err) {
                            return done(err);
                        }

                        done();
                    });
            });
    });

    it('should generate a report correctly when provided in options', function(done) {
        this.timeout(0);

        httpStats.measure(
            {
                url: 'http://localhost:' + port,
                spawn: ['node', nodePath.join(__dirname, 'test-server.js')],
                concurrency: 5,
                beginConcurrency: 1,
                endConcurrency: 3,
                stepRequests: 10,
                concurrencyIncrement: 1,
                report: {
                    outputDir: nodePath.join(__dirname, 'build/report02'),
                    type: 'default'
                }
            },
            function(err, results) {
                if (err) {
                    return done(err);
                }

                expect(results && typeof results === 'object').to.equal(true);
                done();
            });
    });
});

