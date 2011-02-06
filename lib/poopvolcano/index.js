module.exports.PoopVolcano = PoopVolcano;

var util = require('util');
var twitter = require('twitter-node');
var Repl = require('poopvolcano/repl').Repl;

util.inherits(PoopVolcano, require('events').EventEmitter);
function PoopVolcano() {
    var self = this;
    this.repl = null;

    this.start();


}

PoopVolcano.prototype.start = function() {
    this.repl = new Repl();
    var context = {
            poopvolcano: this
    };

    this.repl.update_context(context);

    return this;
};

PoopVolcano.prototype.stop = function() {
    this.repl.stop();
};