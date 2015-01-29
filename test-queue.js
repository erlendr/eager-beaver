var AWS = require('aws-sdk');
AWS.config.loadFromPath('./s3config.json');
var sqs = new AWS.SQS();

var queueUrl = 'https://sqs.eu-west-1.amazonaws.com/342335610929/eagerbeaver';

function sendMessage(messageBody) {
  console.log('sendMessage called with messageBody', messageBody);
  var params = {
    MessageBody: messageBody, /* required */
    QueueUrl: queueUrl, /* required */
    DelaySeconds: 0,
  };

  sqs.sendMessage(params, function(err, data) {
    if (err) {
      console.error('sendMessage error:', err, err.stack); // an error occurred
    }
    else {
      console.log('sendMessage done:', data);           // successful response
    }

    process.exit();
  });
}

var msg = process.argv[2] ? process.argv[2] : 'TESTING-123';
sendMessage(msg);