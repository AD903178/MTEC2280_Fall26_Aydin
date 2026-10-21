const int potPin = 4;

// One button per mode
const int button1Pin = 5;   // Mode 1: all LEDs on
const int button2Pin = 6;   // Mode 2: R -> G -> B alternate
const int button3Pin = 7;   // Mode 3: all LEDs blinking

const int redLED = 9;
const int greenLED = 10;
const int blueLED = 11;

int ledPins[] = {redLED, greenLED, blueLED};
const int numLEDs = sizeof(ledPins) / sizeof(ledPins[0]);

int buttonPins[] = {button1Pin, button2Pin, button3Pin};
const int numButtons = sizeof(buttonPins) / sizeof(buttonPins[0]);

int potValue = 0;
int brightness = 0;

int mode = 1;                       // 1, 2 or 3
bool lastButtonState[3] = {HIGH, HIGH, HIGH};

unsigned long previousMillis = 0;
const unsigned long interval = 500; // 500 ms

int currentLED = 0;                 // used in mode 2
bool blinkState = false;            // used in mode 3

unsigned long lastPrint = 0;
const unsigned long printInterval = 200;

void setAllLEDs(int value)
{
  for (int i = 0; i < numLEDs; i++)
  {
    analogWrite(ledPins[i], value);
  }
}

void setMode(int newMode)
{
  mode = newMode;
  previousMillis = millis();
  currentLED = 0;
  blinkState = true;   // mode 3 starts with LEDs on
  setAllLEDs(0);
}

void setup()
{
  for (int i = 0; i < numButtons; i++)
  {
    pinMode(buttonPins[i], INPUT_PULLUP);
  }

  for (int i = 0; i < numLEDs; i++)
  {
    pinMode(ledPins[i], OUTPUT);
  }

  Serial.begin(115200);
  setMode(1);
}

void loop()
{
  // Potentiometer controls brightness
  potValue = analogRead(potPin);
  brightness = map(potValue, 0, 4095, 0, 255);

  // Button handling (detect press on falling edge)
  for (int i = 0; i < numButtons; i++)
  {
    bool state = digitalRead(buttonPins[i]);

    if (state == LOW && lastButtonState[i] == HIGH)
    {
      setMode(i + 1);
      delay(20);  // simple debounce
    }

    lastButtonState[i] = state;
  }

  unsigned long currentMillis = millis();

  switch (mode)
  {
    // MODE 1: All LEDs on
    case 1:
      setAllLEDs(brightness);
      break;

    // MODE 2: Red, Green, Blue alternate every 500 ms
    case 2:
      if (currentMillis - previousMillis >= interval)
      {
        previousMillis = currentMillis;
        currentLED = (currentLED + 1) % numLEDs;
      }

      setAllLEDs(0);
      analogWrite(ledPins[currentLED], brightness);
      break;

    // MODE 3: All LEDs blinking every 500 ms
    case 3:
      if (currentMillis - previousMillis >= interval)
      {
        previousMillis = currentMillis;
        blinkState = !blinkState;
      }

      setAllLEDs(blinkState ? brightness : 0);
      break;
  }

  // Serial output (throttled so it doesn't flood the monitor)
  if (currentMillis - lastPrint >= printInterval)
  {
    lastPrint = currentMillis;
    Serial.print("Mode: ");
    Serial.print(mode);
    Serial.print(" Pot Value: ");
    Serial.print(potValue);
    Serial.print(" Brightness: ");
    Serial.println(brightness);
  }
}