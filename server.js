var Hapi = require('hapi');

var port = process.env.PORT || 8000;
var host = process.env.HOST || 'localhost';
console.log("port:", port);
console.log("host:", host);

// Create a server with a host and port
var server = new Hapi.Server(host,port,{ cors: true });

// Add the route
server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    reply('Welcome to Eager Beaver 0.1');
  }
});

// Start the server
server.start(function () {
	console.log("Server started at " + server.info.uri);
});
