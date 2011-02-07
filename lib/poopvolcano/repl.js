module.exports = Repl;

var util = require('util'),
    EventEmitter = require('events').EventEmitter;

util.inherits(Repl, EventEmitter);
function Repl(sock, context, error) {
    Repl.super_.call(this);
    this.error = error;
    this.connections = {
        sockets: [],
        clients: []
    };
    this.context = {};
    this.sock = sock || (process.cwd() + "/repl.sock");
    this.prompt = 'poopvolcano> ';
    this.server = null;

    this.update_context(context || {});

    this.start();

    //Add some instance accessors to some methods
    this.connect.self = this;
}

Repl.prototype.open = function() {
    this.update_context.call(
        require('repl').start(this.prompt),
        this.context
    );
    return this;
}

//Also used as repl.start().call(...);
//Must always update this.context[k] = v
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

    self.update_context.call(client, self.context);
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