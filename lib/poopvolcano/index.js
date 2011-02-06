module.exports.PoopVolcano = PoopVolcano;

var util = require('util');
//var twitter = require('twitter-node');
var Repl = require('poopvolcano/repl').Repl;

util.inherits(PoopVolcano, require('events').EventEmitter);
function PoopVolcano() {
    var self = this;
    this.repl = null;
    this.twitter = null;

    //Rebind everyting in starters to self
    for(name in this.starters) {
        if(!this.starters.hasOwnProperty(name)) continue;
        this.starters[name] = this.starters[name].bind(self);
    }

    this.start();
}

PoopVolcano.prototype.starters = {
    repl: function() {
        this.repl = new Repl();
        var context = {
            "$volcano": this
        };

        this.repl.update_context(context);
    }
}

PoopVolcano.prototype.start = function() {
    for(name in this.starters) {
        if(!this.starters.hasOwnProperty(name)) continue;
        this.starters[name]();
    }
    return this;
};

PoopVolcano.prototype.stop = function() {
    this.repl.stop();
};
