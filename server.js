var Hapi = require('hapi');

var host = process.env.PORT || 'localhost';

var server; 

if(process.env.PORT) {
	// Create a server with a host and port
	server = new Hapi.Server(host, { cors: true });
}
else {
	// Create localhost server
	server = new Hapi.Server('localhost', 0, { cors: true });
}

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
