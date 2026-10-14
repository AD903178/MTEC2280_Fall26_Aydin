const int potPin = 4;
const int buttonPin = 5;

const int redLED = 9;
const int greenLED = 10;
const int blueLED = 11;

int potValue = 0;
int brightness = 0;

bool alertMode = false;
bool lastButtonState = HIGH;

unsigned long previousMillis = 0;
const unsigned long interval = 500;

// Array of LED pins
int ledPins[] = {redLED, greenLED, blueLED};
const int numLEDs = sizeof(ledPins) / sizeof(ledPins[0]);

int currentLED = 0;

void setup()
{
  pinMode(buttonPin, INPUT_PULLUP);

  for (int i = 0; i < numLEDs; i++)
  {
    pinMode(ledPins[i], OUTPUT);
  }

  Serial.begin(115200);
}

void loop()
{
  // Analog input
  potValue = analogRead(potPin);

  // Convert ADC value to brightness
  brightness = map(potValue, 0, 4095, 0, 255);

 
  bool buttonState = digitalRead(buttonPin);

  // Toggle mode on button press
  if (buttonState == LOW && lastButtonState == HIGH)
  {
    alertMode = !alertMode;
  }

  lastButtonState = buttonState;

  // NORMAL MODE
  if (!alertMode)
  {
    analogWrite(greenLED, brightness);

    digitalWrite(redLED, LOW);
    digitalWrite(blueLED, LOW);
  }

  // ALERT MODE
  else
  {
    unsigned long currentMillis = millis();

    // Logical operator example
    if ((currentMillis - previousMillis >= interval) &&
        (brightness > 20))
    {
      previousMillis = currentMillis;

      // Turn all LEDs off
      for (int i = 0; i < numLEDs; i++)
      {
        analogWrite(ledPins[i], 0);
      }

      // Turn on current LED
      analogWrite(ledPins[currentLED], brightness);

      currentLED++;

      if (currentLED >= numLEDs)
      {
        currentLED = 0;
      }
    }
  }

  Serial.print("Pot Value: ");
  Serial.print(potValue);
  Serial.print(" Brightness: ");
  Serial.println(brightness);
}