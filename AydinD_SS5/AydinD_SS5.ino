const int LED_PIN = 9;
const int PWM_FREQ = 5000;  
const int PWM_BITS = 8;      

String line = "";

void setLED(int value) {
  value = constrain(value, 0, 255);
#if defined(ESP32)
  #if ESP_ARDUINO_VERSION_MAJOR >= 3
    ledcWrite(LED_PIN, value);          
  #else
    ledcWrite(0, value);                
  #endif
#else
  analogWrite(LED_PIN, value);
#endif
}

void setup() {
  Serial.begin(9600);
#if defined(ESP32)
  #if ESP_ARDUINO_VERSION_MAJOR >= 3
    ledcAttach(LED_PIN, PWM_FREQ, PWM_BITS);
  #else
    ledcSetup(0, PWM_FREQ, PWM_BITS);
    ledcAttachPin(LED_PIN, 0);
  #endif
#else
  pinMode(LED_PIN, OUTPUT);
#endif
  setLED(0);
}

void loop() {
  // Read characters until newline, then parse the number.
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\n') {
      if (line.length() > 0) setLED(line.toInt());
      line = "";
    } else if (c != '\r') {
      line += c;
    }
  }
}