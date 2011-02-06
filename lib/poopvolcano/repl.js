module.exports.Repl = Repl;

function Repl(sock) {
    var net = require('net'),
        events = require('events');

    this.sock = sock || (process.cwd() + "/repl.sock");
    this.prompt = 'poopvolcano> ';
    this.server = net.createServer(this.connect);

    this.start();

    //Add some instance accessors to some methods
    this.connect.self = this;

    events.EventEmitter.call(this);
}

Repl.prototype.connect = function(socket) {
    var repl = require('repl');
    var self = arguments.callee.self,
        client = repl.start(self.prompt, socket);
}

Repl.prototype.start = function() {
    this.server.listen(this.sock);
    return this;
}