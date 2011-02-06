module.exports = Twitter;

var util = require('util');
var twitter = require('twitter-node');

util.inherits(Twitter, require('events').EventEmitter);
function Twitter(keys, error) {
    this.error = error;
    this.keys = keys;
    this.connection = null;

    this.start();
}

Twitter.prototype.start = function() {
    this.connection = new twitter(this.keys);
    var self = this;

    this.connection.verifyCredentials(
        function(data) {
            if(!data.id) {
                self.connection = null;
                self.error({'error': "Unable to verify Twitter credentials"});
            }
        }
    );
    return this;
}

Twitter.prototype.stop = function() {
    var self = this;

}