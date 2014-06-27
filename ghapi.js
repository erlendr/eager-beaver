var GitHubApi = require('github');
var https = require('https');
var fs = require('fs');
var zlib = require('zlib');
var tar = require('tar-fs');

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

var repo = 'staticstack';
var user = 'kyber';
var branch = 'master';

console.log("Getting archive link for branch '" + branch  + "' at '" + user + "/" + repo + "'");
github.repos.getArchiveLink(
{
  user: user,
  repo: repo,
  archive_format: 'tarball',
  ref: branch
},
function (err, res) {
  if(!err) {
    console.log("Done getting archive link, downloading file...");
    var url = res.meta.location;
    var request = https.get(url, function(res) {
      var path = 'work/' + user + '/' + repo + '/';

      res
      .pipe(zlib.createGunzip())
      .pipe(tar.extract(path));
      console.log('Download and extraction done! See: ' + path);
    });
  }
  else {
    console.log("Error:", err);
  }
});
