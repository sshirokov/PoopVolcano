#!/usr/bin/env node
(function() {require('./lib');})(); //Loader scaffold

var options = {
    repl: {
        note: 'Open a REPL into the app',
        value: false
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

var opts = require('optimist').argv;

var keys = require('helpers/path').readJSON('.keys.json') || {};
for(op in keys) {
    if(!keys.hasOwnProperty(op)) continue;
    if(opts[op]) opts[op] = keys[op];
}

//Boot
var PoopVolcano = require('poopvolcano'),
    poop = new PoopVolcano(keys);

if(opts.repl) poop.repl.open();