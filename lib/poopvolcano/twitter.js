module.exports = Twitter;

var util = require('util');
var twitter = require('twitter-node');

util.inherits(Twitter, require('events').EventEmitter);
function Twitter(sock) {
    this.connection = null;

    this.start();
}

Twitter.prototype.start = function() {
    return this;
}

Twitter.prototype.stop = function() {
    var self = this;

}