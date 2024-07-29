export const strategies = {
    SearchAndDestroy: {
        prototype: 'void SearchAndDestroy();',
        implementation: `void SearchAndDestroy() {
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
}`,
        dependencies: [
            'void moveForward(int speed);',
            'void moveBackward(int speed);',
            'void turnLeft(int speed);',
            'void turnRight(int speed);'
        ]
    },
    aggressivePursuit: {
        prototype: 'void aggressivePursuit();',
        implementation: `void aggressivePursuit() {
    // Main navigation logic for aggressive pursuit
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
}`,
        dependencies: [
            'void moveForward(int speed);',
            'void turnRight(int speed);',
            'void turnLeft(int speed);'
        ]
    },
    InitialEvadeAndSearch: {
        prototype: 'void InitialEvadeAndSearch();',
        implementation: `void InitialEvadeAndSearch() {
    // Move backward for the specified time
    moveBackward(SEARCH_SPEED);
    delay(BACKWARD_TIME);

    // Turn left for the specified delay
    turnLeft(SEARCH_SPEED);
    delay(TURN_LEFT_TIME);

    // Continue with SearchAndDestroy strategy
    SearchAndDestroy();
}`,
        dependencies: [
            'void moveBackward(int speed);',
            'void turnLeft(int speed);',
            'void SearchAndDestroy();'
        ]
    }
};
