module.exports.Repl = Repl;

var util = require('util');

util.inherits(Repl, require('events').EventEmitter);
function Repl(sock) {
    this.connections = {
        sockets: [],
        clients: []
    };
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
        repl = require('repl'),
        client = repl.start(self.prompt, socket);


    self.connections.sockets.push(socket);
    self.connections.clients.push(client);
    socket.on('close', function(e) {
                  self.connections.sockets = self.connections.sockets.
                      filter(function(s) { return s != socket; });
                  self.connections.clients = self.connections.clients.
                      filter(function(c) { return c != client; });
    });

    client.context.$repl = client;
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
    var self = this;

    this.connections.clients.map(function(c) { return [c, self.connections.sockets.shift()]; }).forEach(
        function(client_sock) {
            client_sock.shift().displayPrompt = function() {};
            client_sock.shift().destroy();
        }
    );

    self.server.close();
    self.server = null;
}