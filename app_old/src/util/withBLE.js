import React from "react";
import BLEConnectionProvider from "./ble-connection-provider";

export function withBLE(Wrapped) {
  return (props) => (
    <BLEConnectionProvider>
      <Wrapped {...props} />
    </BLEConnectionProvider>
  )
}