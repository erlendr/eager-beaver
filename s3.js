var AWS = require('aws-sdk');
var s3 = require('s3');
var mime = require('mime');

exports.Deploy = Deploy;

function Deploy(bucketName, localDir, callback) {
  AWS.config.loadFromPath('./s3config.json');
  var awsS3Client = new AWS.S3();

  var options = {
    s3Client: awsS3Client,
  };

  var client = s3.createClient(options);

  console.log('Region:', client.s3.config.region);

  console.log('Bucketname:', bucketName);

  createBucket(awsS3Client, bucketName, function(data) {
    putBucketWebsite(awsS3Client, bucketName, function(data) {
      sync(client, bucketName, localDir, callback);
    });
  });

}

function createBucket(awsS3Client, bucketName, callback) {
  console.log('Creating bucket "' + bucketName + '"');

  awsS3Client.createBucket({Bucket: bucketName}, function(err, data) {
    if (err) {
      if(err.code === 'BucketAlreadyOwnedByYou' || 
        err.code === 'BucketAlreadyExists') {
        console.log('Bucket already exists');
        callback();
      }
      else {
        console.error(err, err.stack);
      }
    }
    else  {
      console.log('bucket created:', data.Location);
      callback(data);
    }
  });
}

function putBucketWebsite(awsS3Client, bucketName, callback) {
  console.log('Enabling website for bucket', bucketName);
  var params = {
    Bucket: bucketName,
    WebsiteConfiguration: {
      ErrorDocument: {
        Key: 'error.html'
      },
      IndexDocument: {
        Suffix: 'index.html'
      }
    }
  };

  awsS3Client.putBucketWebsite(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
    }
    else {
      console.log('Bucket website enabled');
      callback(data);
    }
  });
}

function getBucketWebsite(awsS3Client, bucketName, callback) {
  console.log('Getting website info for bucket', bucketName);
  var params = {
    Bucket: bucketName,
  };

  awsS3Client.getBucketWebsite(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
    }
    else {
      console.log('Bucket website info:', data);
      callback(data);
    }
  });
}

function createS3Params(localFile, stat, callback) {
  var s3Params = {
    ContentType: mime.lookup(localFile)
  }

  callback(null, s3Params);
}

function createS3WebsiteUrl(region, bucketName) {
  return 'http://'  + bucketName + '.s3-website-' + region + '.amazonaws.com';
}

function sync(client, bucketName, localDir, callback) {
  var params = {
    localDir: localDir,
    deleteRemoved: false,
    s3Params: {
      Bucket: bucketName,
      Prefix: '',
      ACL: 'public-read'  
    },
    getS3Params: createS3Params
  };

  var uploader = client.uploadDir(params);
  uploader.on('error', function(err) {
    console.error('unable to sync:', err.stack);
    return;
  });
  uploader.on('progress', function() {
    console.log('progress', uploader.progressAmount, uploader.progressTotal);
  });
  uploader.on('end', function() {
    console.log('done uploading');

    var siteUrl = createS3WebsiteUrl(client.s3.config.region, bucketName);
    callback(siteUrl);
  });
}