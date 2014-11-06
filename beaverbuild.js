var fs = require('fs');
var cp = require('child_process');

exports.Build = Build;

function Build(path, callback) {
  var targetPackage = require(path + 'package.json');
  if(!targetPackage) {
    console.error('Error: No package.json found in path "' + path + '"');
    return;
  }

  console.log('Building package ' + targetPackage.name + '@' + targetPackage.version);

  installPackageDeps(path, function(installDir) {
    buildSite(installDir, callback);
  });
}

function installPackageDeps(installDir, callback) {
  child = cp.exec('npm install', {cwd: installDir},
    function(error, stdout, stderr) {
      console.log('installPackageDeps error: ' + stderr);
      if (error !== null) {
        console.log('installPackageDeps error: ' + error);
      }
      //Calling supplied callback
      callback(installDir);
    });

  child.stdout.on('data', function(data) {
    console.log(data)
  })
}

function buildSite(installFolder, callback) {
  child = cp.exec('grunt', { cwd: installFolder},
    function (error, stdout, stderr) {
      console.log('buildSite: ' + stdout);
      console.log('buildSite error: ' + stderr);
      if (error !== null) {
        console.log('buildSite error: ' + error);
      }
      callback(installFolder + '/build/');
    });
}