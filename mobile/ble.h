#ifndef BLE_H
#define BLE_H
#include <Arduino.h>
#include "modes.h"
#include <array>
#include <memory>

void initBLE();

void waitForCommands(const uint32_t timeout);
bool getState();
Mode* getMode();
uint64_t getLastModeChangeTimeMs();
void updateClients();

#endif /* BLE_H */
