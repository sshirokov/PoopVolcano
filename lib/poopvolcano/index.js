module.exports = PoopVolcano;

var util = require('util');

util.inherits(PoopVolcano, require('events').EventEmitter);
function PoopVolcano() {
    var self = this;
    this.repl = null;
    this.twitter = null;

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
                   }
               );
           },
           stop: function() {
               this.repl.stop();
               this.repl = null;
           }},

    twitter: {start: function() {
                  var Twitter = require('poopvolcano/twitter');
                  this.twitter = new Twitter();
              },
              stop: function() {
                  this.twitter.stop();
                  this.twitter = null;
              }}
}


PoopVolcano.prototype.start = function() {
    for(name in this.starters) {
        if(!this.starters.hasOwnProperty(name)) continue;
        this.starters[name].start();
    }
    return this;
};

PoopVolcano.prototype.stop = function() {
    for(name in this.starters) {
        if(!this.starters.hasOwnProperty(name)) continue;
        this.starters[name].stop();
    }
};
