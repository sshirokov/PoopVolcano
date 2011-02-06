#!/usr/bin/env node
(function() {require('./lib');})(); //Loader scaffold
var twitter = require('twitter-node'),
    opts = require('tav');

opts = opts.set(
    {repl: {
         note: 'Open a REPL into the app',
         value: false
     }},
    "Usage: {self} [options]".$format({self: require('helpers').proc.$0()}),
    true // Panic on unknown options
);

console.log("Loading with: ", opts, opts.args);
//REPLs
(function () {
     var net = require('net'),
         repl = require('repl');
     var sock = __dirname + "/repl.sock",
         prompt = 'poopvolcano> ';
     var server = function(fn) { return server = net.createServer(fn); };

     server(function (socket) {
                repl.start(prompt, socket);
     }).listen(__dirname + "/repl.sock");
});