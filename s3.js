var AWS = require('aws-sdk');

AWS.config.loadFromPath('./s3config.json');

var s3 = new AWS.S3();

var bucketName = 'eager-test';

console.log('Bucketname:', bucketName);

createBucket(bucketName);

function createBucket(bucketName) {
  s3.createBucket({Bucket: bucketName}, function(err, data) {
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

  s3.putBucketWebsite(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
    }
    else {
      console.log('Bucket website enabled');
    }
  });
}