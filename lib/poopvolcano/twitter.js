module.exports = Twitter;

var util = require('util');
var twitter = require('twitter-node');

util.inherits(Twitter, require('events').EventEmitter);
function Twitter(keys) {
    this.keys = keys;
    this.connection = null;

    this.start();
}

Twitter.prototype.start = function() {
    console.log("Loading twitter with keys:", this.keys);
    this.connection = new twitter(this.keys);

    return this;
}

Twitter.prototype.stop = function() {
    var self = this;

}