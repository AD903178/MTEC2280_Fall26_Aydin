const int ledPins[4] = {4, 5, 6, 7}; 
const int buttonPin = 18;            

int currentPattern = 0;              
int buttonState = LOW;               
int lastButtonState = LOW;           
unsigned long lastDebounceTime = 0;  
const unsigned long debounceDelay = 50; 


void clearLEDs() {
  for (int i = 0; i < 4; i++) {
    digitalWrite(ledPins[i], LOW);
  }
}

void setup() {
  Serial.begin(115200);

  
  for (int i = 0; i < 4; i++) {
    pinMode(ledPins[i], OUTPUT);
  }


  pinMode(buttonPin, INPUT);

  clearLEDs();
}

void loop() 
{
  int reading = digitalRead(buttonPin);

 
  if (reading != lastButtonState) 
  {
    lastDebounceTime = millis();
  }

  
  if ((millis() - lastDebounceTime) > debounceDelay)
   {
    
    if (reading == HIGH && buttonState == LOW) {
      currentPattern = (currentPattern + 1) % 6; 
      Serial.print("Pattern switched to: ");
      Serial.println(currentPattern + 1);
    }
    buttonState = reading;
  }

  lastButtonState = reading;

  
  displayPattern(currentPattern);
}


void displayPattern(int pattern) {
  
  if (pattern < 3) {
    if (pattern == 0) {
      // Lights all on
      for (int i = 0; i < 4; i++) {
        digitalWrite(ledPins[i], HIGH);
      }
    } 
    else if (pattern == 1) {
      // Flashing Lights
      digitalWrite(ledPins[0], HIGH);
      digitalWrite(ledPins[1], LOW);
      digitalWrite(ledPins[2], HIGH);
      digitalWrite(ledPins[3], LOW);
      delay(250);
      digitalWrite(ledPins[0], LOW);
      digitalWrite(ledPins[1], HIGH);
      digitalWrite(ledPins[2], LOW);
      digitalWrite(ledPins[3], HIGH);
      delay(250);
    } 
    else {
      // Left to right
      for (int i = 0; i < 4; i++) {
        clearLEDs();
        digitalWrite(ledPins[i], HIGH);
        delay(100);
      }
    }
  } 
  
  else if (pattern == 3 || pattern >= 4) {
    if (pattern == 3) {
      // Right to left
      for (int i = 3; i >= 0; i--) {
        clearLEDs();
        digitalWrite(ledPins[i], HIGH);
        delay(100);
      }
    } 
    else if (pattern == 4) {
      // Inward Bounce
      clearLEDs();
      digitalWrite(ledPins[0], HIGH);
      digitalWrite(ledPins[3], HIGH);
      delay(200);
      clearLEDs();
      digitalWrite(ledPins[1], HIGH);
      digitalWrite(ledPins[2], HIGH);
      delay(200);
    } 
    else {
      // Blink
      for (int i = 0; i < 4; i++) {
        digitalWrite(ledPins[i], HIGH);
      }
      delay(100);
      clearLEDs();
      delay(100);
    }
  }
}