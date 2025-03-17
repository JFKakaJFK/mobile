#include <ArduinoBLE.h> // actually https://github.com/dominsch/ArduinoBLE
#include <array>
#include <memory>
#include "leds.h"
#include "modes.h"
#include "config.h"
#include "ble.h"

// !IMPORTANT! disable if the serial monitor is not connected or it will not start
#define DEBUG 1
#define ESP32 1 // just comment out for nano
#ifdef DEBUG
  #pragma message "Running in DEBUG mode"
#endif
#ifdef ESP32 
  #pragma message "compiling for ESP32 (Test setup)"
  #define BAUD_RATE 115200 // Esp32
#else
  #pragma message "compiling for Arduino Nano 33 BLE (Mobile)"
  #define BAUD_RATE 9600   // Arduino Nano BLE
#endif

void initMobile();
void updateMobile();

void setup() {
#ifdef DEBUG
  Serial.begin(BAUD_RATE);
  while (!Serial);
  Serial.print("Starting ...");
#endif
  initLEDs();
  // BLE init
  initBLE();
#ifdef DEBUG
  Serial.println("done");
  Serial.print("Number of modes: "); Serial.println(modes.size());
#endif
}

bool dirty = false;
uint64_t lastUpdate = 0;
cRGB prev[nObjects];
bool colorsChanged = false;
void loop() {
  // 1. handle remote commands if there are any
  waitForCommands(dirty ? 5 : 10);

  // 2. get colors before the update
  getLEDs(prev);

  // 3. update the colors according to the mobile state
  if (getState()) { // turned on
    uint64_t delta = millis() - getLastModeChangeTimeMs();
    getMode()->update(delta);
  } else { // turned off
    setLEDs(cRGB(0));
  }

  // 4. check if the colors changed
  colorsChanged = false;
  for (obj_t i = 0; i < nObjects; i++) {
    if (prev[i] != getLED(i)) {
      colorsChanged = true;
      break;
    }
  }

  // 5. update the LEDs
  if (colorsChanged) {
    updateLEDs();
    dirty = true; // we need to update the BLE clients
  }

  // 6. update the BLE clients if necessary
  if (dirty && millis() - lastUpdate >= maxUpdateFrequency) {
    updateClients();
    dirty = false;
    lastUpdate = millis();

#ifdef DEBUG
    for(obj_t i; i < nObjects; i++){
      cRGB c = getLED(i);
      Serial.print("["); Serial.print(i); Serial.print("]:rgb(");
      Serial.print(c.r); Serial.print(",");
      Serial.print(c.g); Serial.print(",");
      Serial.print(c.g); Serial.println(")");
    }
#endif
  }
}
