const int LED_PIN = 9;
const unsigned long TIMEOUT_MS = 2000;   // LED turns off if p5 goes quiet

unsigned long lastMessage = 0;

void setBrightness(int value) {
  value = constrain(value, 0, 255);
  ledcWrite(LED_PIN, value);
}

void setup() {
  Serial.begin(9600);
  ledcAttach(LED_PIN, 5000, 8);    

  // Power-up self test that fade up and down once to confirm the wiring
  for (int i = 0; i <= 255; i += 5) { setBrightness(i); delay(8); }
  for (int i = 255; i >= 0; i -= 5) { setBrightness(i); delay(8); }

  lastMessage = millis();
}

void loop() {
  if (Serial.available() > 0) {
    String text = Serial.readStringUntil('\n');
    text.trim();
    if (text.length() > 0) {
      setBrightness(text.toInt());
      lastMessage = millis();
    }
  }

  if (millis() - lastMessage > TIMEOUT_MS) {
    setBrightness(0);
  }
}
