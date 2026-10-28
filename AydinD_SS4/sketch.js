
let port;                       // variable for Web Serial port instance
let baudRate = 115200;          // NOTE: baud rate must match in Arduino sketch
let sensors = [0, 0, 0, 0];     // array for: [button1, button2, pot1, pot2]

let r, g, b;                    // background color
let circleDiameter = 100;
let squareSize = 100;
let growthRate = 5;

function setup() 
{
  // canvas and text setup
  createCanvas(800, 800);
  textSize(64);
  textAlign(CENTER, CENTER);
  strokeWeight(5);
  stroke(0);

  //serial communication setup
  port = createSerial();          // create the serial port instance

  let used = usedSerialPorts();   // store previously used serial ports

  if (used.length > 0)            // if there are previously used ports...
  {
    port.open(used[0], baudRate); // reopen last used serial port
  }
}

function draw() 
{
  //***___SERIAL READ___START
  let inString = port.readUntil('\n');

  if (inString.length > 0) //if we received serial data...
  {
    inString = inString.trim(); // remove newline char at end of message

    let parts = inString.split(','); // split incoming string by comma

    if (parts.length === 4) //if we received 4 values...
    {        
      for (let i = 0; i < parts.length; i++) 
      {
        sensors[i] = Number(parts[i]); // convert every String value into Number
      }
    }

    port.clear(); // clear the buffer after reading
    //NOTE: VERY IMPORTANT TO CLEAR BUFFER each frame, otherwise old data will accumulate and cause lag
  }
  //***___SERIAL READ___END

  r = map(sensors[2], 0, 1023, 0, 255);    
  g = map(sensors[3], 0, 1023, 0, 255);
  b = sensors[0] * 255;

  background(r, g * !sensors[1], b);

  fill(255 * !sensors[1]);

  if (sensors[0] && sensors[1]) // pressing both buttons resets both shapes
  {
    circleDiameter = 100;
    squareSize = 100;
  }
  else if (sensors[0]) // button 1 extends the circle
  {
    circleDiameter += growthRate;
  }
  else if (sensors[1]) // button 2 extends the square
  {
    squareSize += growthRate;
  }

  circleDiameter = constrain(circleDiameter, 20, min(width, height * 0.8));
  squareSize = constrain(squareSize, 20, min(width, height));
  square(width / 2, height / 2, squareSize);
  circle(width / 2.5, height / 2.5, circleDiameter);

  fill(255);
  text(sensors, width / 2, height - 120);

  if (port.opened()) // if port is connected...
  {
    text('Connected', width / 2, 120); // display connected status
  }
  else // if port is not connected...
  {
    text('Click to Connect', width / 2, 120); // display instructions
  }
}

function mousePressed() 
{
  if (!port.opened()) //if the port is not connected...
  {
    port.open(baudRate); // open the serial port using selection pop-up
  }
}