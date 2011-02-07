module.exports = Twitter;

var util = require('util'),
    EventEmitter = require('events').EventEmitter;
var twitter = require('./client');

util.inherits(Twitter, EventEmitter);
function Twitter(keys, error) {
    Twitter.super_.call(this);
    this.error = error;
    this.keys = keys;
    this.connection = null;
    this.streams = [];
    this.info = {
        self: {
            id: null,
            screen_name: null
        },
        friends: [],
        limits: {}
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
                    self.connection.createFriendship(
                        data.source.id,
                        function(error, data) {
                            if(!error) self.info.friends.push(data.id);
                        }
                    );
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
                self.watch_rate_limit();
            }
        }
    );
    return this;
}

Twitter.prototype.get_rate_limit = function(callback) {
    var self = this;
    callback = callback || function(e, data) {
        if(e) return;
        self.info.limits = data;
    };
    this.connection.getRateLimitStatus(callback);
    return this;
}

Twitter.prototype.watch_rate_limit = function(interval) {
    if(arguments.callee.interval) clearInterval(arguments.callee.interval);
    arguments.callee.interval = setInterval(this.get_rate_limit.bind(this),
                                            60000);
    return this.get_rate_limit();
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

    if(this.watch_rate_limit.interval) {
        clearInterval(this.watch_rate_limit.interval);
        this.watch_rate_limit.interval = null;
    }

    this.streams = this.streams.filter(
        function(s) {
            console.log("Tearing down stream:", s);
            s.destroy();
            return false;
        }
    );
}