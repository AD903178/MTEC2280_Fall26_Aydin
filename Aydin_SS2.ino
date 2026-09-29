// MIDTERM-WIP_Aydin

int potPin = A0;
int ldrPin = A1;
int buttonPin = 2;
int ledPWM = 9;
int buzzerPin = 10;
int indicatorLED = 13;

int potValue = 0;
int ldrValue = 0;
int mode = 0; 
int buttonState = 0;
int lastButtonState = 0;

unsigned long lastDebounceTime = 0;
unsigned long debounceDelay = 50;

int ldrHistory[5];
int historyIndex = 0;

unsigned long previousMillis = 0;
const long interval = 200; 

void setup() {
  pinMode(buttonPin, INPUT);
  pinMode(ledPWM, OUTPUT);
  pinMode(buzzerPin, OUTPUT);
  pinMode(indicatorLED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    potValue = analogRead(potPin);
    ldrValue = analogRead(ldrPin);

    ldrHistory[historyIndex] = ldrValue;
    historyIndex = (historyIndex + 1) % 5;

    
    int avgLDR = 0;
    for (int i = 0; i < 5; i++) {
      avgLDR += ldrHistory[i];
    }
    avgLDR /= 5;

    
    int reading = digitalRead(buttonPin);
    if (reading != lastButtonState) {
      lastDebounceTime = currentMillis;
    }
    if ((currentMillis - lastDebounceTime) > debounceDelay) {
      if (reading == HIGH && buttonState == LOW) {
        mode = !mode; 
        digitalWrite(indicatorLED, mode); 
      }
      buttonState = reading;
    }
    lastButtonState = reading;

    if (mode == 1) { 
      int ledBrightness = map(potValue, 0, 1023, 0, 255);
      analogWrite(ledPWM, ledBrightness);

      if (avgLDR < 400 && ledBrightness < 100) {
        analogWrite(buzzerPin, 128); 
      } else {
        analogWrite(buzzerPin, 0);
      }

    } else { 
      analogWrite(ledPWM, 0);
      analogWrite(buzzerPin, 0);
    }

    Serial.print("LDR: "); Serial.print(ldrValue);
    Serial.print(" | Pot: "); Serial.print(potValue);
    Serial.print(" | Mode: "); Serial.println(mode);
  }
}

