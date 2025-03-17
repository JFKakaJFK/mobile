#include "leds.h"
#include <Adafruit_NeoPixel.h>
#include "config.h"

Adafruit_NeoPixel strip(nObjects *leds_per_obj, data_pin, NEO_GRB + NEO_KHZ800);
cRGB internalLEDs[nObjects] = {0};

void initLEDs()
{
  strip.begin();
  strip.setBrightness(255);
  strip.clear();
  strip.show();
}

void updateLEDs()
{
  strip.show();
}

void setLED(const obj_t obj, const cRGB c)
{
  internalLEDs[obj] = c;
  const uint8_t i0 = obj * leds_per_obj;
  for (uint8_t i = i0; i < i0 + leds_per_obj; i++)
  {
    strip.setPixelColor(i, c.r, c.g, c.b);
  }
}

cRGB getLED(const obj_t obj)
{
  return internalLEDs[obj];
}

void getLEDs(cRGB *leds) {
  memcpy(leds, internalLEDs, sizeof(cRGB) * nObjects);
  /*
  for (obj_t i = 0; i < nObjects; i++) {
    leds[i] = getLED(i);
  }
  */
}

void getLEDs_b(uint8_t *leds) {
  for (obj_t i = 0; i < nObjects; i++) {
    cRGB c = getLED(i);
    leds[3 * i] = c.r;
    leds[3 * i + 1] = c.g;
    leds[3 * i + 2] = c.b;
#ifdef DEBUG
    Serial.print("["); Serial.print(i); Serial.print("]:rgb(");
    Serial.print(c.r); Serial.print(",");
    Serial.print(c.g); Serial.print(",");
    Serial.print(c.g); Serial.println(")");
#endif
  }
}

void setLEDs(cRGB c) {
  for (obj_t i = 0; i < nObjects; i++) setLED(i, c);
}
