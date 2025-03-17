#ifndef LEDS_H
#define LEDS_H
#include <Arduino.h>
#include "lib.h"

using obj_t = uint8_t;

const obj_t nObjects = 7;
// 1 byte for each rgb channel
const obj_t obj_size = 3 * nObjects;

void initLEDs();

cRGB getLED(const obj_t obj);
void setLED(const obj_t obj, const cRGB c);

void getLEDs(cRGB *leds);
void getLEDs_b(uint8_t *leds);
void setLEDs(cRGB c);

void updateLEDs();

#endif /* LEDS_H */
