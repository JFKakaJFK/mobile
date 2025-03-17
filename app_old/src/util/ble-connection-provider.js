import React, { useCallback, useEffect, useState } from "react";

export const BLEConnectionContext = React.createContext();

// connect = get device

// commands:
// connect, do something, disconnect

export default function BLEConnectionProvider({ children, ...props }) {
  const [error, setError] = useState(null);
  const [device, setDevice] = useState(null);
  const [connection, setConnection] = useState(null);

  const exponentialBackoff = useCallback(async function exponentialBackoff(remaining, delay) {
    try {
      console.debug(`connecting to ${device?.name} (${device?.id})`); //`
      setConnection((await device?.gatt?.connect()));
      setError(null)
    } catch (error) {
      if (remaining === 0) {
        setError("Failed to reconnect.")
      }
      console.debug(`failed, retrying in ${delay}ms`);
      setTimeout(() => exponentialBackoff(--remaining, delay * 2), delay);
    }
  }, [device]);

  const autoreconnect = useCallback(function autoreconnect() {
    exponentialBackoff(8, 10);
  }, [exponentialBackoff]);

  useEffect(() => {
    if (device) {
      autoreconnect();
    } else {
      setConnection(null);
    }
  }, [device, autoreconnect])

  async function connect(options) {
    try {
      if (!(await navigator?.bluetooth?.getAvailability())) {
        return setError("Bluetooth LE is not supported on this device.")
      }
      // search
      const mobile = await navigator?.bluetooth?.requestDevice(options);
      if (!mobile)
        return setError("No device selected, please try again.");
      mobile.ongattserverdisconnected = autoreconnect;
      //mobile?.addEventListener('gattserverdisconnected', autoreconnect);
      // connect
      setDevice(mobile);
      setError(null);
    } catch (error) {
      setError(error?.message)
    }
  }

  async function disconnect() {
    if (!connection) return;
    setConnection(null);
    let mobile = device;
    setDevice(null);
    if (mobile)
      try {
        // disable automatic reconnects
        mobile.ongattserverdisconnected = null;
        //device?.removeEventListener('gattserverdisconnected', autoreconnect);
        // disconnect
        if (mobile?.gatt?.connected)
          await mobile?.gatt?.disconnect();
        setError(null)
      } catch (error) {
        console.error(error)
        setError(error?.message)
      }
  }

  return (
    <BLEConnectionContext.Provider value={{
      connection,
      connect,
      disconnect,
      error
    }}>
      {children}
    </BLEConnectionContext.Provider>
  )
}