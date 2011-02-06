module.exports.Repl = Repl;

util.inherits(Repl, require('events').EventEmitter);
function Repl(sock) {
    this.connections = [];
    this.context = {};
    this.sock = sock || (process.cwd() + "/repl.sock");
    this.prompt = 'poopvolcano> ';
    this.server = null;

    this.start();

    //Add some instance accessors to some methods
    this.connect.self = this;
}

Repl.prototype.update_context = function(update) {
    for(k in update) {
        if(!update.hasOwnProperty(k)) continue;
        this.context[k] = update[k];
    }
    return this;
}

Repl.prototype.connect = function(socket) {
    var self = arguments.callee.self,
        repl = require('repl');
    var client = repl.start(self.prompt, socket);

    self.connections.push(socket);
    socket.on('close', function(e) {
                  var index = self.connections.indexOf(socket);
                  delete self.connections[index];
    });

    for(k in self.context) {
        if(!self.context.hasOwnProperty(k)) continue;
        client.context[k] = self.context[k];
    }
}

Repl.prototype.start = function() {
    var net = require('net');
    var sock = this.sock;
    this.server = net. createServer(this.connect);
    this.server.listen(sock);
    return this;
}

Repl.prototype.stop = function() {
    this.server.close();
    this.server = null;
    this.connections.forEach(function(e) { e.end(); });
}