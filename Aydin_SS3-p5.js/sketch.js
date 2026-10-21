let port;               // serial connection to the ESP32
let connectButton;      // connect / disconnect button

let mode = 1;           // 1, 2 or 3 (from the ESP32 buttons)
let potValue = 0;       // raw ADC reading, 0 - 4095
let brightnessVal = 0;  // 0 - 255, already mapped on the ESP32

let prevMode = 1;       // used to restart the 500 ms timing when mode changes
let modeStart = 0;
let ledOn = [true, true, true];   // virtual red, green, blue LED states

const POT_MAX = 4095;
const STEP_MS = 500;    // same interval as the Arduino sketch

function setup() {
  createCanvas(800, 600);   // within the 400-1080 x 400-720 limits
  textFont('monospace');

  port = createSerial();

  connectButton = createButton('Connect to ESP32');
  connectButton.position(20, 20);
  connectButton.mousePressed(toggleConnection);
}

function draw() {
  // --- get sensor data ---
  if (port.opened()) {
    readSerialData();
  } else {
    // demo mode so you can test without the board:
    // move the mouse left/right to act like the pot, press 1, 2 or 3 for modes
    potValue = int(map(mouseX, 0, width, 0, POT_MAX, true));
    brightnessVal = int(map(potValue, 0, POT_MAX, 0, 255));
  }
  connectButton.html(port.opened() ? 'Disconnect' : 'Connect to ESP32');

  updateLedStates();

  // --- values mapped from the pot (analog sensor) ---
  let bgRed = map(potValue, 0, POT_MAX, 10, 70);          // background color
  let bgBlue = map(potValue, 0, POT_MAX, 40, 150);        // background color
  let barWidth = map(potValue, 0, POT_MAX, 0, 720);       // meter length
  let markerX = map(potValue, 0, POT_MAX, 40, 760);       // marker location
  let diameter = map(potValue, 0, POT_MAX, 60, 380);      // circle size
  let needleAngle = map(potValue, 0, POT_MAX, -PI * 0.75, PI * 0.75); // dial angle

  background(bgRed, 20, bgBlue);

  // --- meter bar (rect) ---
  noFill();
  stroke(255, 120);
  rect(40, 70, 720, 24, 6);
  noStroke();
  fill(brightnessVal, brightnessVal, 255);
  rect(40, 70, barWidth, 24, 6);

  // --- marker that slides along the bar (triangle) ---
  fill(255, 220, 60);
  triangle(markerX, 100, markerX - 10, 122, markerX + 10, 122);

  // --- virtual RGB LED (ellipse): color from LED states, size from pot ---
  let cx = width / 2;
  let cy = 305;
  let r = ledOn[0] ? brightnessVal : 0;
  let g = ledOn[1] ? brightnessVal : 0;
  let b = ledOn[2] ? brightnessVal : 0;
  stroke(255, 80);
  strokeWeight(2);
  fill(r, g, b);
  ellipse(cx, cy, diameter, diameter);

  // --- dial needle (line) ---
  stroke(255);
  strokeWeight(3);
  line(cx, cy, cx + cos(needleAngle) * diameter / 2, cy + sin(needleAngle) * diameter / 2);

  // --- three small LEDs, one per real LED ---
  strokeWeight(2);
  for (let i = 0; i < 3; i++) {
    let x = cx + (i - 1) * 110;
    let on = ledOn[i];
    stroke(255, 100);
    if (i === 0) fill(on ? brightnessVal : 30, 0, 0);
    if (i === 1) fill(0, on ? brightnessVal : 30, 0);
    if (i === 2) fill(0, 0, on ? brightnessVal : 30);
    ellipse(x, 530, 70, 70);
  }

  // --- text readout ---
  noStroke();
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  text('Mode ' + mode + '   Pot ' + potValue + '   Brightness ' + brightnessVal, 40, 580);
  textAlign(RIGHT, CENTER);
  text(port.opened() ? 'Connected' : 'Demo: move mouse, press 1/2/3', width - 40, 32);
}

// Read every complete line the ESP32 has sent and pull out the numbers
function readSerialData() {
  while (port.available() > 0) {
    let line = port.readUntil('\n');
    if (line.length === 0) break;

    let m = line.match(/Mode:\s*(\d+)\s+Pot Value:\s*(\d+)\s+Brightness:\s*(\d+)/);
    if (m) {
      mode = constrain(int(m[1]), 1, 3);
      potValue = constrain(int(m[2]), 0, POT_MAX);
      brightnessVal = constrain(int(m[3]), 0, 255);
    }
  }
}

// Mirror the LED behavior of the Arduino sketch
function updateLedStates() {
  if (mode !== prevMode) {
    prevMode = mode;
    modeStart = millis();
  }
  let step = floor((millis() - modeStart) / STEP_MS);

  if (mode === 1) {
    ledOn = [true, true, true];
  } else if (mode === 2) {
    let current = step % 3;
    ledOn = [current === 0, current === 1, current === 2];
  } else {
    let blinkOn = step % 2 === 0;
    ledOn = [blinkOn, blinkOn, blinkOn];
  }
}

function toggleConnection() {
  if (!port.opened()) {
    port.open(115200);
  } else {
    port.close();
  }
}

// demo mode only
function keyPressed() {
  if (!port.opened() && (key === '1' || key === '2' || key === '3')) {
    mode = int(key);
  }
}
