//Aydin.SS1


const int led1 = 2;
const int led2 = 4;
const int led3 = 5;
const int led4 = 18;


int patternNumber = 0;     
int patternDelay = 500;    
bool isEvenPattern = true; 

void setup() {
  
  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);
  pinMode(led3, OUTPUT);
  pinMode(led4, OUTPUT);
}

void loop() {
  
  isEvenPattern = (patternNumber % 2 == 0);

  // 6 LEDs
  if (patternNumber == 0) {
    digitalWrite(led1, HIGH);
    digitalWrite(led2, LOW);
    digitalWrite(led3, LOW);
    digitalWrite(led4, LOW);
  } 
  else if (patternNumber == 1) {
    digitalWrite(led1, LOW);
    digitalWrite(led2, HIGH);
    digitalWrite(led3, LOW);
    digitalWrite(led4, LOW);
  }
  else if (patternNumber == 2) {
    digitalWrite(led1, HIGH);
    digitalWrite(led2, HIGH);
    digitalWrite(led3, LOW);
    digitalWrite(led4, LOW);
  }
  else if (patternNumber == 3) {
    digitalWrite(led1, LOW);
    digitalWrite(led2, LOW);
    digitalWrite(led3, HIGH);
    digitalWrite(led4, HIGH);
  }
  else if (isEvenPattern) {
    
    digitalWrite(led1, HIGH);
    digitalWrite(led2, LOW);
    digitalWrite(led3, HIGH);
    digitalWrite(led4, LOW);
  } 
  else {
    
    digitalWrite(led1, LOW);
    digitalWrite(led2, HIGH);
    digitalWrite(led3, LOW);
    digitalWrite(led4, HIGH);
  }

  delay(patternDelay); 

  patternNumber++;
  if (patternNumber > 5) {
    patternNumber = 0;
  }
}

