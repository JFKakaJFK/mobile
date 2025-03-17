#include <Arduino.h>
#ifndef MODES_H
#define MODES_H
// #include <stdint.h>

// doesn't really matter but should be enough for all mode parameters
const uint8_t payloadMaxLength = 8;
// send updates at most every maxUpdateFrequency ms
const uint8_t maxUpdateFrequency = 20;

void setMode(const uint8_t* payload);

// returns true iff colors changed
bool updateMobile(const bool state, void (*onLEDChange) (uint8_t*));

#endif /* MODES_H */
