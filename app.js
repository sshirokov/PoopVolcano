#!/usr/bin/env node
(function() {require('./lib');})(); //Loader scaffold

var options = {
    repl: {
        note: 'Open a REPL into the app',
        value: false
    },

    data: {
        note: "Data dir root",
        value: "{0}/data".$format(process.cwd())
    },

    consumer_key: {
        note: "Twitter consumer key"
    },
    consumer_secret: {
        note: "Twitter secret key"
    },
    access_token_key: {
        note: "Twitter access key"
    },
    access_token_secret: {
        note: "Twitter secret key"
    }
};

var keys = require('helpers/path').readJSON('.keys.json') || {};
for(op in keys) {
    if(!keys.hasOwnProperty(op)) continue;
    if(options[op]) options[op].value = keys[op];
}


var opts = require('tav').set(
    options,
    "Usage: {self} [options]".$format({self: require('helpers').proc.$0()}),
    true // Panic on unknown options
);

//Boot
var PoopVolcano = require('poopvolcano'),
    poop = new PoopVolcano();

if(opts.repl) poop.repl.open();