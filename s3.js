var AWS = require('aws-sdk');

AWS.config.loadFromPath('./s3config.json');

var s3 = new AWS.S3();

var bucketName = 'eager-test';

s3.listBuckets(function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else {
    var bucketFound = false;
    for(i = 0; i < data.Buckets.length; i++) {
      if(data.Buckets[i].Name === bucketName) {
        console.log('bucket "' + bucketName + '" found');
        bucketFound = true;
        break;
      }
    }
    if(!bucketFound) {
      console.log('bucket not found, creating...');
      s3.createBucket({Bucket: bucketName}, function(err, data) {
        if (err) console.log(err, err.stack);
        else  {
          console.log('bucket created:', data.Location);
        }
      });
    }
  }
});

function putBucket(bucketName) {
  var params = {
  Bucket: bucketName, // required
  WebsiteConfiguration: { // required
    ErrorDocument: {
      Key: 'error.html' // required
    },
    IndexDocument: {
      Suffix: 'index.html' // required
    },
    RedirectAllRequestsTo: {
      HostName: 'STRING_VALUE', // required
      Protocol: 'http | https'
    }
  };
  s3.putBucketWebsite(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
}