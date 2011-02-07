module.exports = Twitter;

var util = require('util');
var twitter = require('twitter-node');

util.inherits(Twitter, require('events').EventEmitter);
function Twitter(keys, error) {
    this.error = error;
    this.keys = keys;
    this.connection = null;
    this.streams = [];

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
            else self.stream();
        }
    );
    return this;
}

Twitter.prototype.listen_to_stream = function(stream) {
    this.streams.push(stream);
    stream.on('data', function(data) {
                  console.log("From stream:", JSON.stringify(data));
                  if(data.event) {
                      console.log("Event type:", data.event);
                  }
    });
}

Twitter.prototype.stream = function() {
    var self = this;
    this.connection.
        stream('user', self.listen_to_stream.bind(self));
}

Twitter.prototype.stop = function() {
    var self = this;

    this.streams = this.streams.filter(
        function(s) {
            console.log("Tearing down stream:", s);
            s.destroy();
            return false;
        }
    );
}