var npm = require('npm');
var fs = require('fs');

var folder = './work/kyber/staticstack/kyber-staticstack-57b1371/';

var packageName = require(folder + 'package.json').name;
console.log('Package name:', packageName);

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

      console.log('Installing package located in folder', folder);

      npm.commands.install(folder, folder, function (err, data) {
        console.log(err, data)
        if(!err) {
          console.log('Install successful!');
          var installDir = folder + 'node_modules/' + packageName;
          console.log('Package install dir:', installDir);
        }
      });

      npm.on("log", function (message) {
      // log the progress of the installation
      console.log(message);
      });

    });
  });
}