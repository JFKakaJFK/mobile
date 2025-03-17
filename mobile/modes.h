#ifndef MODES_H
#define MODES_H
#include <Arduino.h>
#include "leds.h"
#include "lib.h"

class Mode {
  public:
    virtual void init(const uint8_t* payload) = 0;
    virtual void update(uint64_t delta) = 0;
};

class SingleColor: public Mode{
  public:
    void init(const uint8_t* payload);
    void update(uint64_t delta);
  private:
    static constexpr float fadeDuration = 300.0f; // ms
    cRGB initialColors[nObjects];
    cRGB targetColors[nObjects];
};

class Rainbow: public Mode {
  public:
    void init(const uint8_t* payload);
    void update(uint64_t delta);
  private:
    static constexpr float hueDiff = 360.0f / nObjects;
    float initialHue;
    bool initialDirection;
    bool direction;
    uint8_t changeDirAfter; // no direction changes
    float duration;
};

class ColorRotate: public Mode {
  public:
    void init(const uint8_t* payload);
    void update(uint64_t delta);
  private:
    float duration;
    bool fade;
    cRGB colors[nObjects];
};

#endif /* MODES_H */
