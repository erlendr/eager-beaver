var npm = require('npm');
var fs = require('fs');
var cp = require('child_process');

var folder = './work/kyber/staticstack/kyber-staticstack-57b1371/';

var packageName = require(folder + 'package.json').name;
var deps = require(folder + 'package.json').dependencies;
console.log('Package name:', packageName);
console.log('Package deps:', deps);

installPackage(folder);

var configObject = {};

function installPackage(folder) {
  // Create node_modules folder inside target package folder
  var dirToCreate = folder + 'node_modules/';
  console.log('Creating dir', dirToCreate);

  fs.mkdir(dirToCreate, function() {
    console.log('node_modules dir created');

    npm.load(configObject, function (err) {
      if(err) {
        console.log('Error on NPM load:', err);
        return;
      }

      console.log('Installing dependencies for package located in folder', folder);

      npm.commands.install(folder, Object.keys(deps), function (err, data) {
        console.log(err, data);

        if(!err) {
          console.log('Install successful!');
          var installDir = folder + 'node_modules/' + packageName;
          console.log('Package install dir:', installDir);
          buildSite(installDir);
        }
      });

      npm.on("log", function (message) {
      // log the progress of the installation
      console.log(message);
    });

    });
  });
}

function buildSite(installFolder) {
  child = cp.exec('grunt', { cwd: folder},
    function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
}