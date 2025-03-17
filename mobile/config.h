#ifndef CONFIG_H
#define CONFIG_H
#include <Arduino.h>
#include <array>
#include <memory>
#include "modes.h"

#define M(mode) std::unique_ptr<mode>(new mode())

// BLE
static const auto MOBILE_SERVICE = "19b10000-e8f2-537e-4f6c-d104768a1214";
static const auto MOBILE_READ_STATE = "0001";
static const auto MOBILE_SET_STATE = "0002";

static const auto MOBILE_READ_COLORS = "0003";
static const auto MOBILE_SET_COLORS = "0004";
static const auto MOBILE_READ_MODE = "0005";

static const uint8_t maxUpdateFrequency = 50;//ms

// LEDs
#ifdef ESP32
  static const uint8_t data_pin = 25; // ESP32 Pin 6 is reserved
#else
  static const uint8_t data_pin = 6;  // Arduino Nano BLE
#endif
static const uint8_t leds_per_obj = 3;

// Modes
// all active modes need to be registered here
static const std::array<std::unique_ptr<Mode>, 32> modes = {
  M(SingleColor), //std::unique_ptr<SingleColor>(new SingleColor()),
  M(Rainbow),
  M(ColorRotate),
};

#endif /* CONFIG_H */
