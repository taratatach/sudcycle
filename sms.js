var SinchClient = require('sinch-rtc');
var sinchClient;
var messageClient;

// App key
//93b68f13-45aa-46c5-bb93-b2af2f9343b0:xbEXmz6PlU69jh+AdRff9g

var setup = function() {
  sinchClient = new SinchClient({
    applicationKey: '93b68f13-45aa-46c5-bb93-b2af2f9343b0',
    capabilities: {messaging: true},
  });

  messageClient = sinchClient.getMessageClient();
}

var sendMessage = function(text) {
  var message = messageClient.newMessage(text);

  messageClient.send(message)
  .then(function() {
    console.log("Message sent. Check your phone!");
  })
  .fail(function() {
    console.log("Error! Message not sent");
  });
}

module.exports.setup = setup;
module.exports.sendMessage = sendMessage;