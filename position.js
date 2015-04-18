var tessel = require('tessel');
var accel = require('accel-mma84').use(tessel.port['A']);
var sms = require('./sms.js');

var base = null;

// Send first text
console.log("Setup sms");
sms.setup();
console.log("Sending text using ", sms.sendMessage, "from module ", sms);
sms.sendMessage("Sent from Tessel bi4tch!");

// Initialize the accelerometer.
accel.on('ready', function () {
  // Stream accelerometer data
  accel.on('data', function (xyz) {
    if (!base) {
      base = pos(xyz);
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
