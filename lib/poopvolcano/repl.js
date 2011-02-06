module.exports.Repl = Repl;

function Repl(sock) {
    var net = require('net'),
        events = require('events');

    this.context = {};
    this.sock = sock || (process.cwd() + "/repl.sock");
    this.prompt = 'poopvolcano> ';
    this.server = net.createServer(this.connect);

    this.start();

    //Add some instance accessors to some methods
    this.connect.self = this;

    events.EventEmitter.call(this);
}

Repl.prototype.update_context = function(update) {
    for(k in update) {
        if(!update.hasOwnProperty(k)) continue;
        this.context[k] = update[k];
    }
}

Repl.prototype.connect = function(socket) {
    var self = arguments.callee.self,
        repl = require('repl');
    var client = repl.start(self.prompt, socket);

    for(k in self.context) {
        if(!self.context.hasOwnProperty(k)) continue;
        client.context[k] = self.context[k];
    }
}

Repl.prototype.start = function() {
    this.server.listen(this.sock);
    return this;
}