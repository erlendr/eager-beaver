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
    port: 3000
  });
}

// Add route for receiving worker queue requests
server.route({
  method: 'POST',
  path: '/',
  handler: function (request, reply) {
    server.log('Worker queue request received', '');

    server.log('Response: ', request.payload.name);
    FetchJob();
    reply();
  }
});

function FetchJob(request) {
  server.log('FetchJob started', '');

  JobQueue.ReceiveMessage(function(err, msg) {
    if(err) {
      server.error('Error receiving message from job queue:', err);
    }
    else {
      server.log('Messsage received:', msg);
      var payload = JSON.parse(msg.Body);
      if(payload == null) {
        server.error('Could not parse message body');
      }
      else {
        server.log('Payload parsed');
        handleWebhook(payload);      
      }
    }
  });

  server.log('FetchJob done', '');
};

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
      console.info('Build Server started at ' + server.info.uri);
    });
  }
});

function handleWebhook(payload) {
  server.log('payload.ref:', payload.ref);
  server.log('payload.repository.name:', payload.repository.name);
  server.log('payload.repository.organization:', payload.repository.organization);
  server.log('payload.repository.url:', payload.repository.url);
  server.log('payload.repository.description:', payload.repository.description);
  server.log('payload.repository.owner.name:', payload.repository.owner.name);
  server.log('payload.repository.owner.email:', payload.repository.owner.email);
  server.log('payload.repository.created_at:', payload.repository.created_at);
  server.log('payload.repository.pushed_at:', payload.repository.pushed_at);
  
  //Check for pusher data - Missing if test webhook
  if(payload.pusher && payload.head_commit) {
    server.log('payload.pusher.name:', payload.pusher.name);
    server.log('payload.head_commit.message:', payload.head_commit.message);

    Fetcher.DownloadAndExtractRepo(
      payload.repository.name,
      payload.repository.owner.name,
      payload.repository.master_branch,
      function(targetPackageDir) {
        BeaverBuild.Build(
          './' +
          targetPackageDir 
          + payload.repository.owner.name
          + '-' 
          + payload.repository.name
          + '-'
          + payload.head_commit.id
          + '/',
          function(resultDir) {
          // Setting bucket name to name of repo
          // TODO: Fetch this from repo build config
          var bucketName = "eagerbeaver-" + payload.repository.name;
          S3.Deploy(bucketName, resultDir, function(url) {
            server.log('Site deployed:', url);
            server.log('Cleaning up...');
            rimraf(targetPackageDir, function(err) {
              server.error('Error cleaning up:', err);
            });
          });
        });
      }
    );
  }
  else {
    server.log('payload missing data, test webhook?');
  }
}