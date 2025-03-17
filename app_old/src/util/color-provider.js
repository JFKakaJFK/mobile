import React, { useCallback, useContext, useEffect, useState } from 'react'
import { BLEConnectionContext } from './ble-connection-provider';

export const MOBILE_SERVICE_ID = "19b10000-e8f2-537e-4f6c-d104768a1214";

export const ColorContext = React.createContext();

export function ColorProvider({ children, ...props }) {
  const { connection } = useContext(BLEConnectionContext);
  const [colors, setColors] = useState([]);
  const [error, setError] = useState(null)

  function update(colorsView) {
    setColors([...new Array(colorsView.byteLength / 4)].map((_e, i) => ({
      b: colorsView.getUint8(i * 4),
      g: colorsView.getUint8(i * 4 + 1),
      r: colorsView.getUint8(i * 4 + 2),
    })))
  }

  const handleColorChange = useCallback((e) => update(e.target.value), []);

  useEffect(() => {
    if (!connection) return;
    let colorsCharacteristic;
    (async () => {
      try {
        // access mobile service
        const service = await connection?.getPrimaryService(MOBILE_SERVICE_ID);
        // get colors
        colorsCharacteristic = await service.getCharacteristic(0x0002);
        // listen to notifications (to stop, first await stop + remove event listener)
        await colorsCharacteristic.startNotifications();
        colorsCharacteristic.addEventListener('characteristicvaluechanged', handleColorChange);
        update((await colorsCharacteristic.readValue()));
        setError(null);
      } catch (error) {
        setError(error?.message)
      }
    })();

    return () => {
      // stop notifications
      colorsCharacteristic?.stopNotifications()
        .then(() => {
          colorsCharacteristic?.removeEventListener('characteristicvaluechanged', handleColorChange);
          setError(null);
        })
        .catch(e => setError(e.message));
    }
  }, [connection, handleColorChange]);

  async function setColor(obj, color) {
    if (!connection) return;
    try {
      // access mobile remote
      const service = await connection?.getPrimaryService(MOBILE_SERVICE_ID);
      const remote = await service.getCharacteristic(0x0001);
      // compute payload
      const col = (obj << 24) + (color.r << 16) + (color.g << 8) + color.b;
      await remote.writeValue(Uint32Array.of(col));
      setError(null);
    } catch (error) {
      setError(error?.message)
    }
  }

  return (
    <ColorContext.Provider value={{
      error,
      colors,
      setColor
    }}>
      {children}
    </ColorContext.Provider>
  )
}