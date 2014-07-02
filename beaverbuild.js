var npm = require('npm');
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

  installPackageDeps(path, targetPackage, function(installDir) {
    buildSite(installDir, callback);
  });
}

function installPackageDeps(folder, targetPackage, callback) {
  // Create node_modules folder inside target package folder
  var dirToCreate = folder + 'node_modules/';
  console.log('Creating dir', dirToCreate);

  fs.mkdir(dirToCreate, function() {
    console.log('node_modules dir created');

    npm.load({}, function (err) {
      if(err) {
        console.error('Error on NPM load:', err);
        return;
      }

      console.log('Installing dependencies for package located in folder', folder);

      npm.commands.install(folder, Object.keys(targetPackage.dependencies), function (err, data) {
        if(!err) {
          console.log('Install successful!');
          callback(folder);
        }
        else {
          console.log('Error installing package', err);
          return;
        }
      });

      npm.on("log", function (message) {
        console.log(message);
      });
    });
  });
}

function buildSite(installFolder, callback) {
  child = cp.exec('grunt', { cwd: installFolder},
    function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
      callback(installFolder + '/build/');
    });
}