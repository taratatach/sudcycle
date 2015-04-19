var tessel = require('tessel');
var accel = require('accel-mma84').use(tessel.port['A']);
var sms = require('./sms.js');
var wifi = require('wifi-cc3000');
var pubnub = require('pubnub-hackathon').init({
  publish_key: "pub-c-f54b7aaf-40c5-4de9-ab5c-399ea5f804a8",
  subscribe_key: "sub-c-80f63b78-e5fe-11e4-9571-02ee2ddab7fe"
});

var base = null;
var angles = {};

var pt1 = null, pt2 = null, pt3 = null;
var points = [];
var origin = null;

// Connect to WiFi
if (wifi.isEnabled()) {
  console.log("WiFi is enabled!");

  wifiConnect();
} else {
  console.log("Enabling wifi...");

  wifi.enable(wifiConnect);
}

// Send text on connection
wifi.on('connect', function(res) {
  console.log("Connected!");

  sms.sendMessage("+14154639141", "Your SudCycle device is connected to " + res.ssid);
  console.log("Message sent? ");
});

// Send PubNub message
var message = { "key" : "value" };
pubnub.publish({
  channel: "sudcycle",
  message: message,
  callback: function(e){console.log("success", e);},
  error: function(e){console.log("error", e);}
});

// Listen for messages for device configuration
pubnub.subscribe({
  channel: "sudcycle",
  callback: function(dials) {
    console.log(dials);

    for (dial in dials) {
      if (dial.name == "start") {
        createStart(dial);
      }
      else if (dial.name == "end") {
        createEnd(dial);
      }
      else {
        createAlert(dial);
      }
    }
  }
});

// Initialize the accelerometer.
accel.on('ready', function () {
  // Stream accelerometer data
  accel.on('data', function (xyz) {
    if (!base) {
      base = pos(xyz);
    }

    // Find the origin
    getPoints(xyz);
    if (pt1 && pt2 & pt3) {
      origin = findOrigin(pt1, pt2, pt3);
    }

    if (samePosition(base, pos(xyz))) {
      console.log("Back to base position [", base.toString(), "]");
    }
    else {
      console.log('base: [', base.toString(), ']');
      console.log('current: [', pos(xyz).toString(), ']');
    }
  });
});

accel.on('error', function(err){
  console.log('Error:', err);
});


function getPoints(xyz) {
  if (!pt1) {
    if (points.length == 10) {
      pt1 = points[9];
      points = [];
      console.log("Got one point");
    }
  }
  else if (!pt2) {
    if (points.length == 10) {
      pt2 = points[9];
      points = [];
      console.log("Got two points");
    }
  }
  else if (!pt3) {
    if (points.length == 10) {
      pt3 = points[9];
      points = [];
      console.log("Got three points!");
    }
  }
  else {
    if (pointNotKnown(xyz)) {
      points.push(xyz);
    }
  }
}

function pointNotKnow(xyz) {
  return points[points.length-1][0] != xyz[0] || points[points.length-1][1] != xyz[1] || points[points.length-1][2] != xyz[2];
}

function wifiConnect() {
  console.log("Connecting to WiFi...");
  wifi.connect({
    ssid: "pubnub-ac",
    password: "pubnub.com"
  });
};

function samePosition(base, xyz) {
  if (!base || !xyz) {
    return false;
  }

  return base[0] == xyz[0] && base[1] == xyz[1] && base[2] == xyz[2]
}

function pos(array) {
  return array.map(function(val) {
    return val.toFixed(2);
  });
}

// function find_angle(A,B,C) {
//   var plane = findPlane(A, B, C);

//     var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));
//     var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2));
//     var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
//     return Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
// }

function findOrigin(A, B, C) {
  var vec1 = [B[0] - A[0], B[1] - A[1], B[1] - A[1]];
  var vec2 = [C[0] - A[0], C[1] - A[1], C[1] - A[1]];
  var normal = [
    vec2[2] * vec1[1] - vec2[1] * vec1[2],
    vec2[0] * vec1[2] - vec2[2] * vec1[0],
    vec2[1] * vec1[0] - vec2[0] * vec1[1]
 ];
 var fixed = normal[0] * A[0] + normal[1] * A[1] + normal[2] * A[2];
 var t = fixed / (Math.pow(normal[0], 2) + Math.pow(normal[1], 2) + Math.pow(normal[2], 2));

 return [ t * normal[0], t * normal[1], t * normal[2] ];
}

function createStart(dial) {
  angles[dial.angle] = null;
}

function createEnd(dial) {
  angles[dial.angle] = signalEnd;
}

function createAlert(dial) {
  angles[dial.angle] = signalAlert(dial.name);
}

function signalAlert(name) {
  sms.sendMessage("+14154639141", name + " has been triggered. Go check your laundry!");
}

function signalEnd() {
  sms.sendMessage("+14154639141", "Your cycle is finished. Go get your laundry! ");
}