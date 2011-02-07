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

    this.
        bind_events().
        start();
}

Twitter.prototype.handlers = {
    '_error': function(event, data, callback) {
        var ctx = {
            event: event, code: data.statusCode,
            error: (typeof(data) === "string") ?
                       data : (data.data && data.data.errors ||
                              "Unknown error")
        };
        var error = "EVENT:{event}:error: ";
        if(data.statusCode) error += "(HTTP:{code})";
        console.error(error.$format(ctx));
        if(callback) callback(error);
    },

    // Twitter events we generate and then care about
    'follow': function(data) {
        if(data.source.id == this.info.self.id) return false;
        var self = this;
        console.log("Got Follow:", data.source.screen_name);

        this.connection.createFriendship(
            data.source.id,
            function(error, data) {
                if(!error) self.info.friends.push(data.id);
            }
        );
        return this;
    },

    'direct_message': function(data) {
        //data.text => "Text"
        //data.sender => {screen_name: .., id: ..}
        console.log("Got Direct message:", data.sender.screen_name);
        console.log("-->", data.text);
        return this;
    }
}

Twitter.prototype.bind_events = function() {
    for(handler in this.handlers) {
        if(handler.charAt(0) == '_') continue;
        this.on(handler,
                  this.handlers[handler].bind(this));
    }
    return this;
}

Twitter.prototype.stream = function() {
    var self = this;
    function listen(stream) {
        self.streams.push(stream);
        stream.on('data', function(data) {
                      if(data.friends) self.info.friends = data.friends;
                      else if(data.event) self.emit(data.event, data);
                      else if(data.direct_message) self.emit('direct_message', data.direct_message);
                      else console.log("===> Unknown data:", data); }); }
    this.connection.stream('user', listen);
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