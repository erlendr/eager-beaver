var AWS = require('aws-sdk');
var s3 = require('s3');

AWS.config.loadFromPath('./s3config.json');
var awsS3Client = new AWS.S3();

var options = {
  s3Client: awsS3Client,
};

var client = s3.createClient(options);

var bucketName = 'eager-test';

console.log('Bucketname:', bucketName);

createBucket(bucketName);

function createBucket(bucketName) {
  awsS3Client.createBucket({Bucket: bucketName}, function(err, data) {
    if (err) {
      if(err.code === 'BucketAlreadyOwnedByYou') {
        console.log('Bucket already exists');
        putBucketWebsite(bucketName);
      }
      else {
        console.log(err, err.stack);
      }
    }
    else  {
      console.log('bucket created:', data.Location);
      putBucketWebsite(bucketName);
    }
  });
}

function putBucketWebsite(bucketName) {
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
      sync(bucketName);
    }
  });
}

function sync(bucketName) {
  var params = {
    localDir: './work/erlendr-webhook-test-c086d04',
    deleteRemoved: false,
    s3Params: {
      Bucket: bucketName,
      Prefix: ''
    },
  };

  var uploader = client.uploadDir(params);
  uploader.on('error', function(err) {
    console.error('unable to sync:', err.stack);
  });
  uploader.on('progress', function() {
    console.log('progress', uploader.progressAmount, uploader.progressTotal);
  });
  uploader.on('end', function() {
    console.log('done uploading');
  });
}