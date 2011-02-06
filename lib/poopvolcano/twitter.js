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
    this.connection = new twitter(this.keys);

    this.connection.verifyCredentials(
        function(data) {
            console.log("Twitter Verify:", util.inspect(data));
        }
    );
    return this;
}

Twitter.prototype.stop = function() {
    var self = this;

}