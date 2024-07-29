// Define pin assignments
const int BUTTON_PIN = 4;
const int R_PWM = 5;
const int L_PWM = 3;
const int R_PWM1 = 10;
const int L_PWM1 = 9;
const int R_COLOR_SENSOR = 8;
const int L_COLOR_SENSOR = A0;
const int MIR_SENSOR = 7;
const int R_IR_SENSOR = A2;
const int L_IR_SENSOR = 2;

// Global variables
bool colorSensorError = false; // Flag to indicate color sensor issues
unsigned long startTime = 0;
const int SEARCH_SPEED = 180; // Speed when searching for the opponent
const int TURN_SPEED = 180; // Speed for turning and aggressive actions
const int FOUND_SPEED = 250; // Speed when the opponent is detected and centered
const int BACKWARD_TIME = 1000; // Time to move backward at the beginning
const int TURN_LEFT_TIME = 800; // Time to turn left before starting SearchAndDestroy
String currentStrategy = "SearchAndDestroy"; // Default strategy

// Function prototypes
void turnLeft(int speed);
void turnRight(int speed);
void moveForward(int speed);
void moveBackward(int speed);
void SearchAndDestroy();

void setup() {
    // Initialize pins
    pinMode(R_PWM, OUTPUT);
    pinMode(L_PWM, OUTPUT);
    pinMode(R_PWM1, OUTPUT);
    pinMode(L_PWM1, OUTPUT);
    pinMode(R_COLOR_SENSOR, INPUT);
    pinMode(L_COLOR_SENSOR, INPUT);
    pinMode(MIR_SENSOR, INPUT);
    pinMode(L_IR_SENSOR, INPUT);
    pinMode(R_IR_SENSOR, INPUT);
    pinMode(BUTTON_PIN, INPUT_PULLUP);

    // Set initial PWM values to 0
    analogWrite(R_PWM, 0);
    analogWrite(L_PWM, 0);
    analogWrite(R_PWM1, 0);
    analogWrite(L_PWM1, 0);

    // Wait for button press to start
    while (digitalRead(BUTTON_PIN) == HIGH) {}
    while (digitalRead(BUTTON_PIN) == LOW) {}

    // Wait for 5 seconds as per competition rules
    startTime = millis();
    while (millis() - startTime < 5000) {}

    // Check color sensors for potential issues
    if (digitalRead(R_COLOR_SENSOR) == LOW || digitalRead(L_COLOR_SENSOR) == LOW) {
        colorSensorError = true; // Set flag to ignore color sensors later
        while (digitalRead(MIR_SENSOR) == HIGH && digitalRead(L_IR_SENSOR) == HIGH && digitalRead(R_IR_SENSOR) == HIGH) {}
    }
}

void loop() {
    // Call the selected strategy
    if (!colorSensorError) {
        SearchAndDestroy();
    } else {
        // Error handling logic
        while (true) {
            if (digitalRead(MIR_SENSOR) == HIGH && digitalRead(L_IR_SENSOR) == HIGH && digitalRead(R_IR_SENSOR) == HIGH) {
                turnRight(TURN_SPEED);
            } else if (digitalRead(MIR_SENSOR) == LOW || (digitalRead(R_IR_SENSOR) == LOW && digitalRead(L_IR_SENSOR) == LOW)) {
                moveForward(FOUND_SPEED);
            } else if (digitalRead(L_IR_SENSOR) == LOW && digitalRead(R_IR_SENSOR) == HIGH) {
                if (digitalRead(MIR_SENSOR) == LOW || digitalRead(L_COLOR_SENSOR) == LOW || digitalRead(R_COLOR_SENSOR) == LOW) { break; }
                turnRight(FOUND_SPEED);
            } else if (digitalRead(R_IR_SENSOR) == LOW && digitalRead(L_IR_SENSOR) == HIGH) {
                if (digitalRead(MIR_SENSOR) == LOW) { break; }
                turnLeft(FOUND_SPEED);
            }
        }
    }
}

// Define SearchAndDestroy strategy
void SearchAndDestroy() {
    // Main navigation logic for search and destroy
    while (digitalRead(L_COLOR_SENSOR) == HIGH && digitalRead(R_COLOR_SENSOR) == HIGH) {
        if (digitalRead(MIR_SENSOR) == LOW && digitalRead(L_IR_SENSOR) == HIGH && digitalRead(R_IR_SENSOR) == HIGH) {
            if (digitalRead(L_COLOR_SENSOR) == LOW || digitalRead(R_COLOR_SENSOR) == LOW) { break; }
            moveForward(SEARCH_SPEED);
        }

        if (digitalRead(MIR_SENSOR) == HIGH || (digitalRead(R_IR_SENSOR) == LOW && digitalRead(L_IR_SENSOR) == LOW)) {
            if (digitalRead(L_COLOR_SENSOR) == LOW || digitalRead(R_COLOR_SENSOR) == LOW) { break; }
            moveForward(FOUND_SPEED);
        }

        if (digitalRead(L_IR_SENSOR) == LOW && digitalRead(R_IR_SENSOR) == HIGH) {
            if (digitalRead(MIR_SENSOR) == HIGH || digitalRead(L_COLOR_SENSOR) == LOW || digitalRead(R_COLOR_SENSOR) == LOW) { break; }
            turnRight(FOUND_SPEED);
        }

        if (digitalRead(R_IR_SENSOR) == LOW && digitalRead(L_IR_SENSOR) == HIGH) {
            if (digitalRead(MIR_SENSOR) == HIGH || digitalRead(L_COLOR_SENSOR) == LOW || digitalRead(R_COLOR_SENSOR) == LOW) { break; }
            turnLeft(FOUND_SPEED);
        }
    }

    if (digitalRead(L_COLOR_SENSOR) == LOW && digitalRead(R_COLOR_SENSOR) == HIGH) {
        turnLeft(FOUND_SPEED);
        delay(800);
    } else if (digitalRead(R_COLOR_SENSOR) == LOW && digitalRead(L_COLOR_SENSOR) == HIGH) {
        turnRight(FOUND_SPEED);
        delay(800);
    } else if (digitalRead(L_COLOR_SENSOR) == LOW && digitalRead(R_COLOR_SENSOR) == LOW) {
        moveBackward(FOUND_SPEED);
        delay(1000);
        turnRight(FOUND_SPEED);
        delay(800);
    }
}

// Function definitions
void turnLeft(int speed) {
    analogWrite(R_PWM, 0);
    analogWrite(L_PWM, speed);
    analogWrite(R_PWM1, 0);
    analogWrite(L_PWM1, speed);
}

void turnRight(int speed) {
    analogWrite(R_PWM, speed);
    analogWrite(L_PWM, 0);
    analogWrite(R_PWM1, speed);
    analogWrite(L_PWM1, 0);
}

void moveForward(int speed) {
    analogWrite(R_PWM, 0);
    analogWrite(L_PWM, speed);
    analogWrite(R_PWM1, speed);
    analogWrite(L_PWM1, 0);
}

void moveBackward(int speed) {
    analogWrite(R_PWM, speed);
    analogWrite(L_PWM, 0);
    analogWrite(R_PWM1, 0);
    analogWrite(L_PWM1, speed);
}
