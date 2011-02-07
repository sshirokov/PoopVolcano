module.exports = Twitter;

var util = require('util');
var twitter = require('twitter-node');

util.inherits(Twitter, require('events').EventEmitter);
function Twitter(keys, error) {
    this.error = error;
    this.keys = keys;
    this.connection = null;
    this.streams = [];
    this.info = {
        self: {
            id: null,
            screen_name: null
        },
        friends: []
    };

    this.bind_events();

    this.start();
}

Twitter.prototype.bind_events = function() {
    var self = this;
    this.on('follow', function(data) {
                if(!data.source) {
                    console.error("event:follow:error: (HTTP:{code}): {error}".$format(
                                    {code: data.statusCode || 'UNKNOWN',
                                     error: data.data.error}
                                  ));
                }
                else {
                    if(data.source.id == self.info.self.id) return;
                    var url = '/friendships/create.json',
                        params = {user_id: data.source.id};
                    var callback = function(data) {
                        if(data.following) self.info.friends.push(data.id);
                    };
                    this.connection.post(url, params, null, callback);
                }
            }
    );
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
            else {
                self.info.self.id = data.id;
                self.info.self.screen_name = data.screen_name;
                self.stream();
            }
        }
    );
    return this;
}

Twitter.prototype.emit_twitter_event = function(event, data) {
    console.log("Event type emitted:", event);
    this.emit(event, data);
}

Twitter.prototype.listen_to_stream = function(stream) {
    var self = this;
    this.streams.push(stream);
    stream.on('data', function(data) {
                  if(data.friends)
                      self.info.friends = data.friends;

                  if(data.event) {
                      self.emit_twitter_event(data.event, data);
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