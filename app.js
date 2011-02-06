#!/usr/bin/env node
(function() {require('./lib');})(); //Loader scaffold
var twitter = require('twitter-node');
var Repl = require('poopvolcano/repl').Repl;

require('tav').set(
    {repl: {
         note: 'Open a REPL into the app',
         value: false
     }},
    "Usage: {self} [options]".$format({self: require('helpers').proc.$0()}),
    true // Panic on unknown options
);

var repl = new Repl();

