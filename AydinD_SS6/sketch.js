let serial;
let connectButton;


let pot = 0;             
let btn = [0, 0, 0];
let prevBtn = [0, 0, 0];


let leds = [0, 0, 0];      

let mode = 1;
let phase = 0;             
let orbitAngle = 0;        
let handshakeDone = false;
const MODE_NAMES = ["", "POT DIMMER", "RAINBOW SHOW", "MOUSE MIXER"];

function setup() {
  createCanvas(800, 500);
  textFont("monospace");

  serial = createSerial();
  let used = usedSerialPorts();
  if (used.length > 0) serial.open(used[0], 9600);

  connectButton = createButton("Connect to ESP32");
  connectButton.position(10, height + 10);
  connectButton.mousePressed(() => {
    if (!serial.opened()) serial.open(9600);
    else serial.close();
  });
}

function draw() {
 // reads arduino
  let gotReply = false;
  if (serial.opened()) {
    let last = null;
    while (serial.availableBytes() > 0) {
      let s = serial.readUntil("\n");
      if (!s) break;
      last = s.trim();
    }
    if (last !== null) {
      if (last === "hello") {
        handshakeDone = false;
        gotReply = true;           
  
      } 
      else 
        {
             let parts = last.split(",").map(Number);
        if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
          pot = parts[0];
          prevBtn = btn.slice();
          btn = parts.slice(1);
          handshakeDone = true;
          gotReply = true;
        }
      }
    }
  }

  // the selection of buttons
  for (let i = 0; i < 3; i++) {
    if (btn[i] === 1 && prevBtn[i] === 0) mode = i + 1;
  }

  // computes LED values for mode
  if (mode === 1) {
    leds = [pot, pot, pot];
  } else if (mode === 2) {
    phase += map(pot, 0, 255, 0.01, 0.15);
    leds = [
      127 + 127 * sin(phase),
      127 + 127 * sin(phase + TWO_PI / 3),
      127 + 127 * sin(phase + (2 * TWO_PI) / 3),
    ];
  } else {
    leds = [
      map(mouseX, 0, width, 0, 255, true),
      map(mouseY, 0, height, 0, 255, true),
      pot,
    ];
  }
  leds = leds.map((v) => floor(v));

  // sends LED values to the arduino
  if (gotReply) serial.write(leds.join(",") + "\n");

  drawScene();
}

function drawScene() {
  // background changes by the LED color mixing
  background(leds[0] * 0.2, leds[1] * 0.2, leds[2] * 0.2);

  // title screen
  fill(255);
  noStroke();
  textSize(22);
  textAlign(LEFT, TOP);
  text("Mode " + mode + ": " + MODE_NAMES[mode], 20, 20);
  textSize(14);
  fill(handshakeDone ? "#4cff7a" : "#ffb347");
  text(
    serial.opened()
      ? handshakeDone ? "Handshake OK" : "Waiting for ESP32..."
      : "Not connected - click Connect",
    20, 52
  );
  fill(200);
  text("Buttons 1/2/3 = switch mode", 20, 74);

  // pot gauge
  let potAngle = map(pot, 0, 255, 0, TWO_PI);
  noFill();
  stroke(80);
  strokeWeight(14);
  ellipse(150, 260, 160, 160);
  stroke(255, 220, 80);
  arc(150, 260, 160, 160, -HALF_PI, -HALF_PI + potAngle);
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);
  text(pot, 150, 260);
  textSize(14);
  text("POT", 150, 365);

  // three LED indicators which are circles
  let labels = ["R", "G", "B"];
  for (let i = 0; i < 3; i++) {
    let x = 330 + i * 90;
    let c = [0, 0, 0];
    c[i] = leds[i];
    stroke(255);
    strokeWeight(2);
    fill(c[0], c[1], c[2]);
    ellipse(x, 260, 70, 70);
    noStroke();
    fill(255);
    textSize(14);
    text(labels[i] + " " + leds[i], x, 315);
    // intensity bar which is a rectangle
    fill(60);
    rect(x - 15, 340, 30, 100);
    fill(c[0] + 60 * (i !== 0), c[1] + 60 * (i !== 1), c[2] + 60 * (i !== 2));
    let h = map(leds[i], 0, 255, 0, 100);
    rect(x - 15, 440 - h, 30, h);
  }

  // button indicators which are triangles, light up when pressed or selected
  for (let i = 0; i < 3; i++) {
    let x = 640 + i * 50;
    let active = btn[i] === 1;
    stroke(255);
    strokeWeight(active ? 4 : 1);
    fill(mode === i + 1 ? "#4cff7a" : 70);
    triangle(x, 90, x - 18, 125, x + 18, 125);
    noStroke();
    fill(255);
    textSize(12);
    text("B" + (i + 1), x, 140);
  }

  // animated orbiting ball whose speed follows the pot
  orbitAngle += map(pot, 0, 255, 0.02, 0.2);
  let cx = 650, cy = 330;
  stroke(120);
  strokeWeight(1);
  noFill();
  ellipse(cx, cy, 160, 160);
  line(cx, cy, cx + 80 * cos(orbitAngle), cy + 80 * sin(orbitAngle));
  noStroke();
  fill(leds[0], leds[1], leds[2]);
  ellipse(cx + 80 * cos(orbitAngle), cy + 80 * sin(orbitAngle), 28, 28);

  // mouse crosshair 
  if (mode === 3) {
    stroke(255, 150);
    strokeWeight(1);
    line(mouseX, 0, mouseX, height);
    line(0, mouseY, width, mouseY);
  }
}