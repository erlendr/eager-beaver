var Hapi = require('hapi');

var server; 

if(process.env.PORT) {
	// Azure init
	server = new Hapi.Server(process.env.PORT, { cors: true });
}
else {
	// Create localhost server
	server = new Hapi.Server('localhost', 8000, { cors: true });
}

// Add the route
server.route({
	method: 'GET',
	path: '/',
	handler: function (request, reply) {
		console.log(request);
		reply('Welcome to Eager Beaver 0.1');
	}
});

// Start the server
server.start(function () {
	console.log("Server started at " + server.info.uri);
});
