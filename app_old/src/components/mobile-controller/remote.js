import React, { useContext, useState } from 'react'
import { BLEConnectionContext } from '../../util/ble-connection-provider';
import { ColorContext } from '../../util/color-provider';
import Error from '../error';
import { Back, Meteorite, Moon, Planet, Power, Rocket, Satellite, Saturn, Sun } from '../icons';
import Button from '../button'
import Header from './header';
import ObjectRemote from './object-remote';

const POSITION = {
  parent: {
    width: '100vw',
    maxWidth: '400px',
    height: '70vh',
    maxHeight: '400px',
  },
  positions: [
    { left: '20%', top: '75%', transform: `translateZ(0) translateX(-50%) translateY(-50%) scale(1.1)` },
    { left: '70%', top: '80%', transform: `translateZ(0) translateX(-50%) translateY(-50%) scale(.9)` },
    { left: '72%', top: '20%', transform: `translateZ(0) translateX(-50%) translateY(-50%) scale(.9)` },
    { left: '76%', top: '52%', transform: `translateZ(0) translateX(-50%) translateY(-50%) scale(.9)` },
    { left: '18%', top: '25%', transform: `translateZ(0) translateX(-50%) translateY(-50%) scale(.9)` },
    { left: '36%', top: '56%', transform: `translateZ(0) translateX(-50%) translateY(-50%) scale(.9)` },
    { left: '57%', top: '40%', transform: `translateZ(0) translateX(-50%) translateY(-50%) scale(.9)` }
  ],
  p(obj) {
    return this.positions[obj % this.positions.length];
  }
};

const PLANETS = [
  Sun,
  Planet,
  Satellite,
  Saturn,
  Moon,
  Meteorite,
  Rocket,
];

export default function MobileRemote() {
  const { error: bleError, disconnect } = useContext(BLEConnectionContext);
  const { colors, error: remoteError, setColor } = useContext(ColorContext);

  const [selectedObject, setSelectedObject] = useState(null);

  async function off() {
    for (let obj = 0; obj < colors.length; obj++) {
      await setColor(obj, { r: 0, g: 0, b: 0 });
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      {
        selectedObject !== null
          ? <ObjectRemote back={() => setSelectedObject(null)} objs={selectedObject} />
          : <>
            <Header
              left={<Back tabIndex={0} role="button" className="text-baby-blue" onClick={disconnect} />}
              right={<Power tabIndex={0} role="button" className="text-baby-blue" onClick={off} />}
            >Select object</Header>
            <main className="flex-1 flex flex-col justify-center items-center">
              <Error message={bleError || remoteError} />

              <div className="relative mx-auto" style={{ ...POSITION.parent }}>
                {[...new Array(7)]
                  .map((_, i) => (colors.length > 0 ? colors[i % colors.length] : ({ r: 0, g: 0, b: 0 })))
                  .map((c, i) => {
                    const P = PLANETS[i % PLANETS.length];
                    const pos = POSITION.p(i);
                    return (
                      <>
                        <span key={`_${i}`} className=" absolute block" style={{
                          width: 2,
                          backgroundColor: '#0045CB',
                          height: '100vh',
                          zIndex: -2,
                          left: pos.left,
                          top: `calc(${pos.top} - 100vh)`,
                        }} />
                        <P
                          key={i}
                          className="absolute cursor-pointer"
                          style={{ color: `rgb(${c.r},${c.g},${c.b})`, ...pos, width: 72 }}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedObject([i])}
                          onKeyPress={(e) => ['Space', 'Enter'].includes(e.code) && setSelectedObject(i)}
                        />
                      </>
                    )
                  })}
              </div>

              <Button onClick={() => setSelectedObject(colors.map((_, i) => i))}>Change all</Button>
            </main>
          </>
      }
    </div>
  )
}