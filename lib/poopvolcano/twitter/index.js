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
    // Error callback for event handlers
    _error: function(event, data, callback) {
        var ctx = {
            event: event, code: data.statusCode,
            error: (typeof(data) === "string") ?
                       data : (data.data && data.data.errors ||
                              "Unknown error"),
            extra: '',
            message: "Unknown error"
        };
        var error = "EVENT:{event}:error: {extra} {message}";
        if(data.statusCode) ctx.extra = "(HTTP:{0})".$format(data.Statuscode);
        if(data.data) try { ctx.message = JSON.parse(data.data).error || ctx.message; }
                      catch(e) {}

        console.error(error.$format(ctx));
        if(callback) callback(error);
    },

    // Not-quite-twitter events
    tag: function(user, tagged) {
        var template = "Ding! @{user} just tagged {people}",
            ctx = {
                user: user.screen_name,
                people: tagged.
                            map(function(u) { return '@' + u; }).
                            join(", ").
                            replace(/^(.+), (.+)$/, "$1 and $2")
            };
        console.log("Tag:", template.$format(ctx));
        this.connection.updateStatus(
                template.$format(ctx),
                function(data) {
                    if(!data.id) self.handlers._error('tag', data);
                }
        );
    },

    poop: function(data) {
        var self = this;
        console.log("{0} pooped on {1}".$format(data.from.screen_name, data.date));
        var opts = require("tav"),
            reply = require("helpers").path.readJSON(opts.data + "/responses.json");
        reply = (reply && reply.responses &&
                   reply.responses[
                       Math.round(Math.random() * (reply.responses.length - 1))
                   ]) ||
                   "I have forgotten everything I know about poop!!!!";
        console.log("Tell that guy:", reply);
        this.connection.newDirectMessage(
            data.from.id, reply,
            function(data) {
                if(!data.id) self.handlers._error('poop', data);
            }
        );

        self.maybe_tag(data.from, data.message);
    },

    // Twitter events we generate and then care about
    follow: function(data) {
        if(data.source.id == this.info.self.id) return false;
        var self = this;
        console.log("Got Follow:", data.source.screen_name);

        this.connection.createFriendship(
            data.source.id,
            function(error, data) {
                if(!error) self.info.friends.push(data.id);
                else self.handlers._error('follow', data);
            }
        );
        return this;
    },

    direct_message: function(data) {
        //data.text => "Text"
        //data.sender => {screen_name: .., id: ..}
        console.log("Got Direct message:", data.sender.screen_name);
        console.log("-->", data.text);
        var self = this,
            ctx = {message: ''},
            template = '"{message}" @' + data.sender.screen_name;
        ctx.message = data.text.slice(0, 140 - template.$format(ctx).length);

        this.emit("poop", {
                      date: data.created_at,
                      from: data.sender,
                      message: {text: data.text,
                                id: data.id}
        });

        if(ctx.message.length < 2)
            console.log("---> Secret!");
        else
            this.connection.updateStatus(
                template.$format(ctx),
                function(data) {
                    if(!data.id) self.handlers._error('direct_message', data);
                }
            );
        return this;
    },

    tweet: function(data) {
        console.log("Saw tweet from {user}: {text}".$format(
                        {user: data.user.screen_name,
                         text: data.text}));
    },

    'tweet:self': function(data) {
        console.log("Skipping my own update");
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

Twitter.prototype.maybe_tag = function(user, message) {
    var self = this;

    function use_messages(messages) {
        var now = new Date(),
            qualifies = 15 * 60 * 1000, //15 Minutes -> ms
            tagged = messages.
                       filter(function(m) {
                                  return (now - (new Date(m.created_at))) <= qualifies; }).
                       filter(function(m) {
                                  return m.sender.id != user.id; }).
                       reduce(function(acc, m) {
                                  if(acc.indexOf(m.sender.screen_name) == -1)
                                      return acc.concat(m.sender.screen_name);
                                  else return acc;},
                              []);
        if(tagged.length) self.emit('tag', user, tagged);
    }

    this.connection.getDirectMessages(
        {max_id: message.id},
        function(data) {
            if(!(data.length > 0)) self.handlers._error('poop:maybe_tag', "Bad data from getDirectMessages");
            else use_messages(data);
        }
    );
}

Twitter.prototype.stream = function() {
    var self = this;
    function listen(stream) {
        self.streams.push(stream);
        stream.on('data', function(data) {
                      if(data.friends) self.info.friends = data.friends;
                      else if(data.event) self.emit(data.event, data);
                      else if(data.direct_message && data.direct_message.recipient.id)
                          if(data.direct_message.recipient.id == self.info.self.id)
                              self.emit('direct_message', data.direct_message);
                          else;
                      else if(data.text && data.user)
                          if(data.user.id == self.info.self.id) self.emit('tweet:self', data);
                          else self.emit('tweet', data);
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