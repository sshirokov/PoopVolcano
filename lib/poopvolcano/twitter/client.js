module.exports = Twitter;

var util = require('util');
var twitter = require('twitter-node');

util.inherits(Twitter, twitter);
function Twitter() {
    Twitter.super_.apply(this, arguments);
}