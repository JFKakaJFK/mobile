#include <ArduinoBLE.h> // actually https://github.com/dominsch/ArduinoBLE
#include <Arduino.h>
#include "ble.h"
#include "config.h"
#include "leds.h"

// mobile service offers following characteristics
BLEService mobile(MOBILE_SERVICE);
BLEBoolCharacteristic state(MOBILE_READ_STATE, BLERead | BLENotify | BLEIndicate);
BLEBoolCharacteristic setState(MOBILE_SET_STATE, BLEWrite);
BLECharacteristic colors(MOBILE_READ_COLORS, BLERead | BLENotify | BLEIndicate, obj_size);
// size needs to be at least enough for the largest mode payload
BLECharacteristic setColors(MOBILE_SET_COLORS, BLEWrite, 32);

BLEByteCharacteristic mode(MOBILE_READ_MODE, BLERead | BLENotify | BLEIndicate);

bool getState(){
  return state.value() > 0;
}

void updateClients(){
  uint8_t payload[obj_size];
  getLEDs_b(payload);
  colors.writeValue(payload, obj_size);
}

void onConnect(BLEDevice central);
void onDisconnect(BLEDevice central);
void onSetState(BLEDevice central, BLECharacteristic characteristic);
void onSetColors(BLEDevice central, BLECharacteristic characteristic);

void initBLE(){
  while (!BLE.begin());

  // device name
  BLE.setDeviceName("Mobile");
  BLE.setLocalName("Mobile");

  // mobile service
  BLE.setAdvertisedServiceUuid(MOBILE_SERVICE);
  BLE.setAdvertisedService(mobile);

  // allow state to we read
  mobile.addCharacteristic(state);
  state.setValue(false);
  // allow changing the state
  mobile.addCharacteristic(setState);
  setState.setEventHandler(BLEWritten, onSetState);
  // allow reading the mode
  mobile.addCharacteristic(mode);
  mode.setValue(0);

  // allow reading the object colors
  mobile.addCharacteristic(colors);
  byte tmp[obj_size];
  getLEDs_b(tmp);
  colors.setValue(tmp, obj_size);
  // allow changing the colors
  mobile.addCharacteristic(setColors);
  setColors.setEventHandler(BLEWritten, onSetColors);

  // add service
  BLE.addService(mobile);

  // handle connects/disconnects
  BLE.setEventHandler(BLEConnected, onConnect);
  BLE.setEventHandler(BLEDisconnected, onDisconnect);

  // start advertising
  BLE.advertise();
}

void waitForCommands(const uint32_t timeout){
  BLE.poll(timeout);
}

uint64_t lastModeChangeTimeMs;
uint64_t getLastModeChangeTimeMs(){
  return lastModeChangeTimeMs;
}

void onSetState(BLEDevice central, BLECharacteristic characteristic) {
#ifdef DEBUG
  Serial.print("setState "); Serial.println(setState.value());
#endif
  // update state
  if (setState.value() != state.value())
    state.writeValue(setState.value() > 0);
}

Mode* getMode(){
   return &*modes[mode.value()];
}

void onSetColors(BLEDevice central, BLECharacteristic characteristic) {
#ifdef DEBUG
  Serial.print("setColor ");
  for (byte i = 0; i < setColors.valueLength(); i++) {
    Serial.print(setColors.value()[i]);
    Serial.print(",");
  }
  Serial.println("");
#endif

  // changing the color/mode turns on the mobile automatically (but does not restore the stored colors!)
  if (!state.value()) {
    state.writeValue(true);
  }

  mode.writeValue(setColors.value()[0] % modes.size());
  modes[mode.value()]->init(&setColors.value()[1]);
  lastModeChangeTimeMs = millis();
}

void onConnect(BLEDevice central) {
#ifdef DEBUG
  Serial.print("Connected event, central: ");
  Serial.println(central.address());
#endif
}

void onDisconnect(BLEDevice central) {
#ifdef DEBUG
  Serial.print("Disconnected event, central: ");
  Serial.println(central.address());
#endif
}
