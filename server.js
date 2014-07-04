var Hapi = require('hapi');
var Fs = require('fs');
var BeaverBuild = require('./beaverbuild');
var Fetcher = require('./fetcher');
var S3 = require('./s3');

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

server.route({
  method: 'POST',
  path: '/',
  handler: function (request, reply) {
    console.log('webhook request received');

    var payload = JSON.parse(request.payload.payload);

    handleWebhook(payload);

    reply({ 
      greeting: 'Thanks Github!'
    });
  }
});

// Start the server
server.start(function () {
  console.log("Server started at " + server.info.uri);
});

function handleWebhook(payload) {
  console.log(payload.head_commit.id.substring(0, 7));
  console.log('payload.ref:', payload.ref);
  console.log('payload.repository.name:', payload.repository.name);
  console.log('payload.repository.organization:', payload.repository.organization);
  console.log('payload.repository.url:', payload.repository.url);
  console.log('payload.repository.description:', payload.repository.description);
  console.log('payload.repository.owner.name:', payload.repository.owner.name);
  console.log('payload.repository.owner.email:', payload.repository.owner.email);
  console.log('payload.repository.created_at:', payload.repository.created_at);
  console.log('payload.repository.pushed_at:', payload.repository.pushed_at);
  console.log('payload.pusher.name:', payload.pusher.name);
  console.log('payload.head_commit.message:', payload.head_commit.message);

  Fetcher.DownloadAndExtractRepo(
    payload.repository.name,
    payload.repository.organization,
    payload.repository.master_branch,
    function(targetPackageDir) {
      BeaverBuild.Build(
        './' +
        targetPackageDir 
        + payload.repository.organization 
        + '-' 
        + payload.repository.name
        + '-'
        + payload.head_commit.id.substring(0, 7)
        + '/',
        function(resultDir) {
          var bucketName = payload.repository.name;
          S3.Deploy(bucketName, resultDir, function(url) {
            console.log(url);
          });
      });
    }
  );
}
