#!/usr/bin/env node
(function() {require('./lib');})(); //Loader scaffold
var twitter = require('twitter-node');


//REPLs
(function() {
     var net = require('net'),
         repl = require('repl');
     var prompt = 'poopvolcano> ';

     repl.start(prompt);

     net.createServer(function (socket) {
                          repl.start(prompt, socket);
                      }
     ).listen(__dirname + "/repl.sock");
})();