#include "modes.h"

// --- SINGLE COLOR MODE ---

void SingleColor::init(const uint8_t* payload) {
  // copy initial colors
  getLEDs(initialColors);
  // get target colors
  cRGB c = cRGB(payload[1], payload[2], payload[3]);
  for (obj_t i = 0; i < nObjects; i++)
    targetColors[i] = payload[0] & (1 << i) ? c : initialColors[i];
}

void SingleColor::update(uint64_t delta) {
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

void Rainbow::init(const uint8_t* payload) {
  initialHue = millis() % 360;
  initialDirection = payload[0];
  direction = payload[0];
  changeDirAfter = payload[1];
  duration = ((payload[2] << 8) + payload[3]) * 100;
#ifdef DEBUG
  Serial.print("RAINBOW: direction: ");
  Serial.print(direction);
  Serial.print(", changeDirAfter: ");
  Serial.print(changeDirAfter);
  Serial.print(", duration: ");
  Serial.print(duration);
  Serial.println("ms");
#endif
}

// TODO dir changes
void Rainbow::update(uint64_t delta) {
  if (changeDirAfter > 0) {
    direction = ((int) (delta / duration / changeDirAfter)) % 2 == 0  ? initialDirection : !initialDirection;
  }
  float rotations = delta / duration;
  float hue_change = 360.0f * (rotations - static_cast<int>(rotations));
  float start_hue = fmod(initialHue + (direction ? hue_change : - hue_change), 360);
  for (obj_t i = 0; i < nObjects; i++) {
    setLED(i, cHSV(start_hue + hueDiff * i, 1.0f, 1.0f).toRGB());
  }
}

// --- COLOR ROTATE MODE

void ColorRotate::init(const uint8_t* payload) {
  getLEDs(colors);

  fade = payload[0];
  duration = ((payload[1] << 8) + payload[2]) * 100;
}

// TODO fix fade
void ColorRotate::update(uint64_t delta) {
  float nRotations = delta / duration;
  float progress = nRotations - static_cast<int>(nRotations);
  int offset = nObjects * progress;

  for (obj_t i = 0; i < nObjects; i++) {
    cRGB color = colors[(i + offset) % nObjects];
    setLED(i, fade 
      ? colors[(i + offset-1) % nObjects].fadeTo(color, fmod(nObjects * progress, 1)) 
      : color
    );
  }
}
