var fs = require('fs');
var cp = require('child_process');

exports.Build = Build;

function Build(path, callback) {
  var targetPackage = require(path + 'package.json');
  if(!targetPackage) {
    console.error('Error: No package.json found in path "' + path + '"');
    return;
  }

  var targetBuildConfig = require(path + 'buildconfig.json');
  if(!targetBuildConfig) {
    console.error('Error: No buildconfig.json found in path "' + path + '"');
    return;
  }

  console.log('Building package ' + targetPackage.name + '@' + targetPackage.version);

  installPackageDeps(path, function(installDir) {
    buildSite(installDir, callback);
  });
}

function installPackageDeps(installDir, callback) {
  console.log('Installing dependencies');
  child = cp.exec('npm install', {cwd: installDir},
    function(error, stdout, stderr) {
      console.log('installPackageDeps error: ' + stderr);
      if (error !== null) {
        console.error('installPackageDeps error: ' + error);
      }
      
      //Calling supplied callback
      callback(installDir);
    });

  child.stdout.on('data', function(data) {
    console.log(data)
  })
}

function buildSite(installFolder, buildConfig, callback) {
  if(!buildConfig.buildCommand) {
    console.error('buildconfig.json missing buildCommand');
    return;
  }

  if(!buildConfig.buildOutputDir) {
    console.error('buildconfig.json missing buildOutputDir');
    return;
  }

  console.log('buildSite executing "' + buildConfig.buildCommand + '"...');

  child = cp.exec(buildConfig.buildCommand, { cwd: installFolder},
    function (error, stdout, stderr) {
      console.log('buildSite: ' + stdout);
      console.log('buildSite error: ' + stderr);
      
      if (error !== null) {
        console.log('buildSite error: ' + error);
      }

      //Calling supplied callback
      callback(installFolder + buildConfig.buildOutputDir);
    });
}