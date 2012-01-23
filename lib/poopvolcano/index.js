module.exports = PoopVolcano;

var util = require('util'),
    EventEmitter = require('events').EventEmitter;

util.inherits(PoopVolcano, EventEmitter);
function PoopVolcano(keys) {
    PoopVolcano.super_.call(this);
    var self = this;
    this.repl = null;
    this.twitter = null;
    this.keys = keys;

    //Rebind everyting in starters to self
    for(name in this.starters) {
        if(!this.starters.hasOwnProperty(name)) continue;
        this.starters[name].start = this.starters[name].start.bind(self);
        this.starters[name].stop = this.starters[name].stop.bind(self);
    }

    this.start();
}

PoopVolcano.prototype.starters = {
    repl: {start: function() {
               var Repl = require('poopvolcano/repl');
               this.repl = new Repl(
                   null, {
                       "$volcano": this
                   },
                   this.error
               );
           },
           stop: function() {
               this.repl.stop();
               this.repl = null;
           }},

    twitter: {start: function() {
                  var Twitter = require('poopvolcano/twitter'),
                      opts = require('optimist').argv;
                  this.twitter = new Twitter(this.keys,
                      this.error
                  );
              },
              stop: function() {
                  this.twitter.stop();
                  this.twitter = null;
              }}
}

PoopVolcano.prototype.error = function(data) {
    var error = "Error: {error}".$format(data);
    console.log("Error has occurred: {e}".$format({e:error}));
    throw error;
}

PoopVolcano.prototype.start = function() {
    for(name in this.starters) {
        if(!this.starters.hasOwnProperty(name)) continue;
        this.starters[name].start();
    }
    return this;
};

PoopVolcano.prototype.stop = function() {
    var self = this;
    for(name in this.starters) {
        if(!this.starters.hasOwnProperty(name)) continue;
        this.starters[name].stop();
    }
};
