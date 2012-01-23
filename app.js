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

//ENV Vars win
if(process.env['TWITTER_CONSUMER_KEY']) keys['consumer_key'] = process.env['TWITTER_CONSUMER_KEY'];
if(process.env['TWITTER_CONSUMER_SECERT']) keys['consumer_secret'] = process.env['TWITTER_CONSUMER_SECERT'];
if(process.env['TWITTER_ACCESS_TOKEN_KEY']) keys['access_token_key'] = process.env['TWITTER_ACCESS_TOKEN_KEY'];
if(process.env['TWITTER_ACCESS_TOKEN_SECRET']) keys['access_token_secret'] = process.env['TWITTER_ACCESS_TOKEN_SECRET'];


if(process.env['HEROKU']) {
    var http = require('http');
    http.createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('');
    }).listen(process.env['PORT'], "0.0.0.0");

    //Prevent heroku from idle killing us
    setInterval( function() {
        http.get({host: "pooptag.herokuapp.com"}, function(res) {});
    }, 30000); //30 seconds
    
}


//Boot
var PoopVolcano = require('poopvolcano'),
    poop = new PoopVolcano(keys);

if(opts.repl) poop.repl.open();