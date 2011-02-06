#!/usr/bin/env node
(function() {require('./lib');})(); //Loader scaffold

var opts = require('tav').set(
    {repl: {
         note: 'Open a REPL into the app',
         value: false
     }},
    "Usage: {self} [options]".$format({self: require('helpers').proc.$0()}),
    true // Panic on unknown options
);

//Boot
var PoopVolcano = require('poopvolcano'),
    poop = new PoopVolcano();

if(opts.repl) poop.repl.open();