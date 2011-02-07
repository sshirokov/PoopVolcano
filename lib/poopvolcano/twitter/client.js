module.exports = Twitter;

var util = require('util');
var twitter = require('twitter-node');

util.inherits(Twitter, twitter);
function Twitter() {
    Twitter.super_.apply(this, arguments);
}

Twitter.prototype.createFriendship = function(name_or_id, callback) {
    callback = callback || function(error, data) { };
    var url = '/friendships/create.json',
        _callback = function(data) {
            if(data.statusCode) callback(true, data);
            else callback(false, data);
        };
    var params = typeof(name_or_id) === "number" ? {user_id: name_or_id} : {screen_name: name_or_id};
    this.post(url, params, _callback);
    return this;
}

Twitter.prototype.getRateLimitStatus = function(callback) {
    callback = callback || function(error, data) { };
    var url = "/account/rate_limit_status.json",
        _callback = function(data) {
            if(data.statusCode) callback(true, data);
            else callback(false, data);
        };
    this.get(url, _callback);
    return this;
}