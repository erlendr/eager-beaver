var GitHubApi = require('github');
var https = require('https');
var fs = require('fs');
var zlib = require('zlib');
var tar = require('tar-fs');

var github = new GitHubApi({
  version: '3.0.0',
  debug: false,
  protocol: 'https',
  host: 'github.knowit.no',
  pathPrefix: '/api/v3',
  timeout: 5000
});

exports.DownloadAndExtractRepo = DownloadAndExtractRepo;

function DownloadAndExtractRepo(repo, user, branch, callback) {
  if(!process.env.token) {
    console.error('Error: Github token not set');
    return;
  }

  console.log('Authenticating against Github using oauth...')
  github.authenticate({
    type: 'oauth',
    token: process.env.token
  });

  console.log('Getting archive link for branch "' + branch  + '" at "' + user + '/' + repo + '"');
  github.repos.getArchiveLink(
  {
    user: user,
    repo: repo,
    archive_format: 'tarball',
    ref: branch
  },
  function (err, res) {
    if(err) {
      console.error('Error getting archive link:', err);
      return;
    }

    console.log('Done getting archive link, downloading file...');
    var url = res.meta.location;

    var request = https.get(url, function(res) {
      var path = 'work/' + user + '/' + repo + '/';

      res
      .pipe(zlib.createGunzip())
      .pipe(tar.extract(path))
      .on('finish', function () {
        console.log('Download and extraction done! Path: ' + path);
        callback(path);
      });
    });
  });
}