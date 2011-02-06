module.exports.PoopVolcano = PoopVolcano;

var twitter = require('twitter-node');
var Repl = require('poopvolcano/repl').Repl;

function PoopVolcano() {
    var self = this;
    this.repl = null;

    this.start();

    require('events').EventEmitter.call(this);
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