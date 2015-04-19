var tessel = require('tessel');
var accel = require('accel-mma84').use(tessel.port['A']);
var sms = require('./sms.js');
var wifi = require('wifi-cc3000');

var base = null;

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

// Initialize the accelerometer.
// accel.on('ready', function () {
//   // Stream accelerometer data
//   accel.on('data', function (xyz) {
//     if (!base) {
//       base = pos(xyz);
//     }

//     if (samePosition(base, pos(xyz))) {
//       console.log("Back to base position [", base.toString(), "]");
//     }
//     else {
//       console.log('base: [', base.toString(), ']');
//       console.log('current: [', pos(xyz).toString(), ']');
//     }
//   });
// });

// accel.on('error', function(err){
//   console.log('Error:', err);
// });

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
