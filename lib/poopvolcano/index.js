module.exports.PoopVolcano = PoopVolcano;

var util = require('util');
var Repl = require('poopvolcano/repl').Repl;

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
               this.repl = new Repl();
               var context = {
                   "$volcano": this
               };

               this.repl.update_context(context);
           },
           stop: function() {
               this.repl.stop();
               this.repl = null;
           }},

    twitter: {start: function() {
                  var twitter = require('twitter-node');
              },
              stop: function() {

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
