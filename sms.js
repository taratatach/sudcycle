var https = require('https');

// App key:App secret
//93b68f13-45aa-46c5-bb93-b2af2f9343b0:xbEXmz6PlU69jh+AdRff9g

var sms = {};

sms.sendMessage = function(phoneNumber, message) {
  console.log("Trying to send " + message + " to " + phoneNumber);
  console.log("Setting up Sinch...");
  var auth = sinchAuth();
  console.log("Setting up message body...")
  var body = JSON.stringify({ message: message });
  console.log("Request body: ", body);

  console.log("Setting up request...");
  var options = {
    hostname: "messagingApi.sinch.com",
    port: 443,
    path: "/v1/sms/" + phoneNumber,
    method: 'POST',
    headers : {
      "Content-Type" : "application/json",
      "Content-Length" : body.length,
      "Authorization" : auth
    }
  };
  console.log("Request options: ", options);

  // Set up the request
  var req = https.request(options, function(res) {
    // console.log(res.data);
    res.setEncoding('utf8');
    res.on('error', function(err) {
      console.log("Got error: ", err);
    })
    res.on('data', function(data) {
      console.log("Message: ", data);
    });
  });

  // post the data
  console.log("Sending message...")
  req.write(body);
  req.end();
};

sms.getStatus = function(messageId){
  var auth = sinchAuth();
  var options = {
    method: 'GET',
    url : "https://messagingApi.sinch.com/v1/sms/" + messageId,
    headers : {
      "Content-Type" : "application/json",
      "Authorization" : auth
    }
  };

  http.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('end', function (data) {
      console.log('BODY: ' + data);
    });
  }).end();
};

var sinchAuth = function(){
  var appKey = "93b68f13-45aa-46c5-bb93-b2af2f9343b0", secret = "xbEXmz6PlU69jh+AdRff9g==";

  if (appKey && secret){
    _auth = "Basic " + new Buffer("application\\" + appKey + ":" + secret).toString("base64");
  }

  return _auth;
};

module.exports = sms;