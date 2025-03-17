#include "leds.h"
#include "lib.h"
#include "modes.h"

enum Mode {
  SingleColor,
  Rainbow,
  ColorRotate
};

// --- SINGLE COLOR MODE ---
const float fadeDuration = 300.0f; // ms
cRGB initialColors[nObjects];
cRGB targetColors[nObjects];
void initSingleColor(const uint8_t* payload){
  // copy initial colors
  getLEDs(initialColors);
  // get target colors
  cRGB c = cRGB(payload[2], payload[3], payload[4]);
  for (obj_t i = 0; i < nObjects; i++) {
     targetColors[i] = payload[1] & (1 << i) 
      ? c 
      : initialColors[i];
  }
}
void updateSingleColor(uint64_t delta){
  // loop over all objs
  for (obj_t i = 0; i < nObjects; i++) {
    if (targetColors[i] != getLED(i)) {
      // if color is not target color, fade towards target color (store time of last change
      if (delta < fadeDuration) {
        setLED(i, initialColors[i].fadeTo(targetColors[i], delta / fadeDuration));
      } else {
        setLED(i, targetColors[i]);
      }
    }
  }
}
// --- RAINBOW MODE ---
const float hueDiff = 360.0f / nObjects;
uint8_t direction = 0;
uint8_t initialHue = 0;
uint8_t changeDirAfter = 0; // no direction changes
uint16_t duration = 5000; // 5s
void initRainbow(const uint8_t* payload){
  initialHue = millis() & 0xFF;
  direction = payload[1];
  changeDirAfter = payload[2];
  duration = (payload[3] << 8) + payload[4];
}

void updateRainbow(uint64_t delta){
  //float start_hue = (initialHue + 360.0f * delta / duration) % 360.0f;
  uint8_t start_hue = 0;
  for(obj_t i = 0; i < nObjects; i++){
    //setLED(i, cHSV(start_hue + hueDiff * i, 1.0f, 1.0f);
  }
}

uint64_t setModeTime;
Mode mode;
void setMode(const uint8_t* payload){
  switch(payload[0]){
    case Mode::SingleColor: {
      initSingleColor(payload);
    } break;
  }
  setModeTime = millis();
}

bool dirty = false;
uint64_t lastUpdate = 0;
bool updateMobile(const bool state, void (*onLEDChange) (uint8_t*)){
  // get colors before
  cRGB prev[nObjects];
  getLEDs(prev);

  uint64_t delta = millis() - setModeTime;
  
  switch(mode){
    case Mode::SingleColor: {
      updateSingleColor(delta);
    } break;
  }

  for(obj_t i = 0; i < nObjects; i++){
    if(prev[i] != getLED(i)){
      dirty = true;
      break;
    }
  }

  // call on change handler
  if(dirty && millis() - lastUpdate >= maxUpdateFrequency){
    uint8_t* payload[obj_size];
    getLEDs_b(*payload);
    onLEDChange(*payload);
    dirty = false;
    lastUpdate = millis();
  }

  return dirty;
}
