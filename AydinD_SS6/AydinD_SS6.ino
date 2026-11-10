const int POT_PIN = 4;
const int BTN_PINS[3] = {5, 6, 7};
const int LED_PINS[3] = {9, 10, 11};   

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < 3; i++) {
    pinMode(BTN_PINS[i], INPUT_PULLUP);
    pinMode(LED_PINS[i], OUTPUT);
    analogWrite(LED_PINS[i], 0);
  }
  analogReadResolution(12);

  // hello
  while (Serial.available() <= 0) {
    Serial.println("hello");
    delay(300);
  }
}

void loop() {
  if (Serial.available() > 0) {
    String line = Serial.readStringUntil('\n');
    line.trim();

    int r, g, b;
    if (sscanf(line.c_str(), "%d,%d,%d", &r, &g, &b) == 3) {
      analogWrite(LED_PINS[0], constrain(r, 0, 255));
      analogWrite(LED_PINS[1], constrain(g, 0, 255));
      analogWrite(LED_PINS[2], constrain(b, 0, 255));
    }

    //sensor data response
    int pot = analogRead(POT_PIN) / 16;   
    Serial.print(pot);
    for (int i = 0; i < 3; i++) {
      Serial.print(",");
      Serial.print(digitalRead(BTN_PINS[i]) == LOW ? 1 : 0);
    }
    Serial.println();
  }
}