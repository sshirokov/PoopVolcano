#!/usr/bin/env node
(function() {require('./lib');})(); //Loader scaffold

var opts = require('tav').set(
    {repl: {
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
    },
    "Usage: {self} [options]".$format({self: require('helpers').proc.$0()}),
    true // Panic on unknown options
);

//Boot
var PoopVolcano = require('poopvolcano'),
    poop = new PoopVolcano();

if(opts.repl) poop.repl.open();