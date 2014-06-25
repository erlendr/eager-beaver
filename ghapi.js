var GitHubApi = require('github');
var https = require('https');
var fs = require('fs');
var zlib = require('zlib');
var tar = require('tar');

var github = new GitHubApi({
  // required
  version: '3.0.0',
  // optional
  debug: false,
  protocol: 'https',
  host: 'github.knowit.no',
  pathPrefix: '/api/v3', // for some GHEs
  timeout: 5000
});

// or oauth key/ secret
github.authenticate({
  type: 'oauth',
  token: process.env.token
});

github.repos.getArchiveLink(
{
  user: 'erlendr',
  repo: 'webhook-test',
  archive_format: 'tarball',
  ref: 'master'
},
function (err, res) {
  console.log('res.meta.location:', res.meta.location);
  var url = res.meta.location;
  var request = https.get(url, function(response) {
    response
    .pipe(zlib.createGunzip())
    .pipe(tar.Extract({
      path: 'work/'
    }));
    console.log('Archive inflated');
  });
});

