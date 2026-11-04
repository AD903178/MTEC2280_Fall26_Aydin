let serial;
let mode = "PULSE";      // "PULSE" or "FOLLOW"
let brightness = 0;      // 0-255, what the LED gets
let phase = 0;           // animation phase for pulse + wave
let connectBtn, modeBtn;

function setup() {
  createCanvas(640, 480);   // within 400-1080 x 400-720
  textFont("monospace");

  serial = createSerial();

  connectBtn = createButton("Connect to Arduino");
  connectBtn.position(10, height + 10);
  connectBtn.mousePressed(connectSerial);

  modeBtn = createButton("Switch mode");
  modeBtn.position(170, height + 10);
  modeBtn.mousePressed(toggleMode);
}

function draw() {
  background(20, 24, 34);
  phase += 0.04;

  //compute brightness depending on mode 
  if (mode === "PULSE") {
    brightness = (sin(phase) * 0.5 + 0.5) * 255;           // breathing
  } else {
    brightness = constrain(map(mouseX, 0, width, 0, 255), 0, 255); // follow mouse
  }
  brightness = round(brightness);

  //send to hardware (only when connected) 
  if (serial.opened()) {
    serial.write(brightness + "\n");
  }

  drawWave();
  drawLED();
  drawBar();
  drawHUD();
}

// line-based animated sine wave, amplitude tied to brightness
function drawWave() {
  stroke(80, 200, 255, 160);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let x = 0; x < width; x += 8) {
    let y = height - 120 + sin(x * 0.03 + phase * 2) * (brightness / 255) * 30;
    vertex(x, y);
  }
  endShape();
  stroke(60);
  strokeWeight(1);
  line(0, height - 120, width, height - 120);   // baseline
}

// ellipses (virtual LED with a glow that matches real brightness)
function drawLED() {
  const cx = width / 2, cy = 190;
  noStroke();
  for (let r = 220; r > 0; r -= 20) {            // glow rings
    fill(255, 200, 60, map(brightness, 0, 255, 0, 14));
    ellipse(cx, cy, r, r);
  }
  stroke(200);
  strokeWeight(3);
  fill(255, 200, 60, 40 + brightness * 0.85);    // LED body
  ellipse(cx, cy, 110, 110);
  noStroke();
  fill(255, 255, 255, brightness * 0.5);         // highlight
  ellipse(cx - 20, cy - 22, 28, 18);
}

// rectangles  (brightness meter)
function drawBar() {
  const bx = 120, by = height - 60, bw = width - 240, bh = 22;
  stroke(200);
  strokeWeight(2);
  noFill();
  rect(bx, by, bw, bh, 6);
  noStroke();
  fill(255, 200, 60);
  rect(bx, by, map(brightness, 0, 255, 0, bw), bh, 6);
}

function drawHUD() {
  noStroke();
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text("Mode: " + mode, 14, 14);
  text("Brightness: " + brightness, 14, 36);
  fill(serial.opened() ? color(80, 255, 120) : color(255, 90, 90));
  text(serial.opened() ? "Serial: connected" : "Serial: not connected", 14, 58);
  fill(160);
  textSize(12);
  textAlign(CENTER, TOP);
  text(
    mode === "FOLLOW" ? "Move mouse left/right to dim or brighten" : "LED breathes automatically",
    width / 2, height - 28
  );
}

function toggleMode() {
  mode = mode === "PULSE" ? "FOLLOW" : "PULSE";
}

function connectSerial() {
  if (!serial.opened()) serial.open(9600);
}

function keyPressed() {
  if (key === " ") toggleMode();
  if (key === "c" || key === "C") connectSerial();
}
