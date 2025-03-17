import { BleClient, BleDevice, RequestBleDeviceOptions } from '@capacitor-community/bluetooth-le'
import { useRef, useState } from 'react'

export type BLEDevice = BleDevice | null

export interface UseBLEOptions {
  requestDeviceOptions?: RequestBleDeviceOptions
  onConnect?: (device: BleDevice) => Promise<void>
}

/**
 * Hook for exposing the BLE device
 * @param errorCallback called on error
 * @returns 
 */
export function useBLE(options: UseBLEOptions) {
  const [device, setDevice] = useState<BLEDevice>(null)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const reconnect = useRef(true)


  // do connect + cb
  async function connect(device: BleDevice) {
    if (connected) return

    await BleClient.disconnect(device.deviceId) // 
    await BleClient.connect(device.deviceId, onDisconnect)
    setConnected(true)
    if (options.onConnect) {
      await options.onConnect(device)
    }
  }

  // handle disconnect (reconnect if it should)
  async function onDisconnect() { // TODO retries + exponential backoff or sth
    setConnected(false)
    if (device && reconnect.current) {
      await connect(device)
    }
  }

  /**
   * Tries to pair with a BLE device
   */
  async function _pair() {
    reconnect.current = true
    if (device) return device
    // select a device
    await BleClient.initialize()
    let d = await BleClient.requestDevice(options.requestDeviceOptions)
    // connect to the device
    await connect(d)
    setDevice(d)
    return d
  }

  /**
   * Fully disconnects from a BLE device
   */
  async function unpair() {
    reconnect.current = false
    if (device) {
      await BleClient.disconnect(device.deviceId)
    }
    setDevice(null)
    setError(null)
  }

  /**
   * Function for communicating with a BLE device
   * @param f
   */
  async function withBLE(f: (device: BleDevice) => Promise<void>, onError?: (err: string) => (void | Promise<void>)) {
    try {
      setError(null)
      setLoading(true)
      // select a device
      let d = await _pair()
      // wait for the communication to end
      await f(d)
      setError(null)
    } catch (err: unknown) { // TODO more granular error handling for i18n to work...
      console.error(err)
      if (err instanceof Error) {
        if (onError instanceof Function) onError(err.message)
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    error,
    loading,
    paired: device !== null,
    connected,
    async pair() {
      try {
        await unpair()
        await _pair()
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        }
      }
    },
    unpair,
    device,
    withBLE,
  }
}