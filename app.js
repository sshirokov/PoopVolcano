#!/usr/bin/env node
(function() {require('./lib');})(); //Loader scaffold

require('tav').set(
    {repl: {
         note: 'Open a REPL into the app',
         value: false
     }},
    "Usage: {self} [options]".$format({self: require('helpers').proc.$0()}),
    true // Panic on unknown options
);

//Boot
new (require('poopvolcano').PoopVolcano);