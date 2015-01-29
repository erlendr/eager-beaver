var Hapi = require('hapi');
var Fs = require('fs');
var BeaverBuild = require('./beaverbuild');
var Fetcher = require('./fetcher');
var S3 = require('./s3');
var rimraf = require('rimraf')
var Good = require('good');
var JobQueue = require('./job-queue');

var server; 

if(process.env.PORT) {
  // Azure init
  server = new Hapi.Server();
  server.connection({
    port: process.env.PORT
  });
}
else {
  // Create localhost server
  server = new Hapi.Server();
  server.connection({
    port: 8000
  });
}

// Set up views
server.views({
  engines: {
    html: require('handlebars')
  },
  path: './views',
  layoutPath: './views/layout',
  helpersPath: './views/helpers',
  partialsPath: './views/partials',
  isCached: false //Remove in production!
});

// Add route for rendering home page
server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    reply.view('index');
  }
});

// Add route for receiving webhook requests
server.route({
  method: 'POST',
  path: '/',
  handler: function (request, reply) {
    server.log('Webhook request received:', request.payload.payload);

    server.log('Sending webhook payload to job queue...')
    JobQueue.SendMessage(request.payload.payload, function (err, data) {
      server.log('Done sending webhook payload to job queue', data);
      if(err) {
        server.log('Job queue error:', err);
      }
    });

    reply({ 
      greeting: 'Thanks Github!'
    });
  }
});

var options = {
  opsInterval: 1000,
  reporters: [{
    reporter: require('good-console'),
    args:[{ log: '*', response: '*' }]
  }]
};

server.register({
  register: require('good'),
  options: options
}, function (err) {
  if (err) {
    console.error(err);
  }
  else {
    server.start(function () {
      console.info('Job Manager server started at ' + server.info.uri);
    });
  }
});