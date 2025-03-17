
import React, { useCallback, useContext, useState } from 'react'
import { BLEConnectionContext } from '../../util/ble-connection-provider';
import { ColorContext } from '../../util/color-provider';
import RgbPicker from '../rgb-picker';
import Header from './header';
import Error from '../error';
import { Back, Power } from '../icons';

const PRESETS = [
  { r: 0, g: 255, b: 255 },
  { r: 255, g: 0, b: 255 },
  { r: 255, g: 255, b: 0 },
  { r: 0xFF, g: 0x88, b: 0xC0 }, // #FF88C0 
  { r: 0xFF, g: 0xD4, b: 0xEC }, // #FFD4EC
  { r: 0xFF, g: 0xFC, b: 0x97 }, // #FFFC97
  { r: 0xFF, g: 0xFE, b: 0xE1 }, // #FFFEE1
  { r: 0xA0, g: 0xE8, b: 0xFF }, // #A0E8FF
  { r: 0xE0, g: 0xF8, b: 0xFF }, // #E0F8FF
];

export default function ObjectRemote({ back, objs }) {
  const { error: bleError } = useContext(BLEConnectionContext);
  const { colors, setColor, error: remoteError } = useContext(ColorContext);

  const [loading, setLoading] = useState(false);

  const setObjectColor = useCallback(function (color) {
    if (loading) return
    setLoading(true);
    (async () => {
      for (let obj of objs) {
        await setColor(obj, color);
      }
      setLoading(false)
    })();
  }, [objs, loading, setColor]);

  return (
    <>
      <Header
        left={<Back tabIndex={0} role="button" className="text-baby-blue" onClick={back} />}
        right={<Power tabIndex={0} role="button" className="text-baby-blue" onClick={() => setObjectColor({ r: 0, g: 0, b: 0 })} />}
      >Pick a color</Header>
      <main className="flex-1 flex flex-col justify-center items-center">
        <Error message={bleError || remoteError} />

        {objs.length > 0 && <RgbPicker color={colors[objs[0]]} onChange={setObjectColor} />}

        <div className="mt-8 p-4 grid grid-flow-row grid-cols-5 gap-2">
          {PRESETS.map((c, i) => <button
            type="button"
            key={i}
            className="rounded"
            aria-label="button"
            style={{
              width: 48,
              height: 48,
              background: `rgb(${c.r},${c.g},${c.b})`
            }}
            onClick={() => setObjectColor(c)}
          />)}
        </div>
      </main>
    </>
  )
}