var AWS = require('aws-sdk');
AWS.config.loadFromPath('./s3config.json');
var sqs = new AWS.SQS();

var queueUrl = 'https://sqs.eu-west-1.amazonaws.com/342335610929/eagerbeaver';

function receiveMessage() {
  var params = {
    QueueUrl: queueUrl, /* required */
    AttributeNames: [
    'Policy | VisibilityTimeout | MaximumMessageSize | MessageRetentionPeriod | ApproximateNumberOfMessages | ApproximateNumberOfMessagesNotVisible | CreatedTimestamp | LastModifiedTimestamp | QueueArn | ApproximateNumberOfMessagesDelayed | DelaySeconds | ReceiveMessageWaitTimeSeconds | RedrivePolicy',
    /* more items */
    ],
    MaxNumberOfMessages: 1,
  };

  sqs.receiveMessage(params, function(err, data) {
    if (err) {
      console.error(err, err.stack); // an error occurred
    }
    else {
      var messages = data.Messages;
      if(messages) {
        var firstMessage = messages[0];
        console.log('Received message: '  + JSON.stringify(firstMessage));
        deleteMessage(firstMessage.ReceiptHandle);
      }
    }
  });
}

function deleteMessage(receiptHandle) {
  var params = {
    QueueUrl: queueUrl, /* required */
    ReceiptHandle: receiptHandle /* required */
  };
  sqs.deleteMessage(params, function(err, data) {
    if (err) {
      console.error('Error deleting message:', err, err.stack); // an error occurred
    }
    else     {
      console.log('Message deleted: ', data);           // successful response
    }
  });
};

setInterval(receiveMessage, 2000);