import { AspectRatio, Button, Group, Modal } from "@mantine/core";
import { useMemo, useState } from "react";
import tc from "tinycolor2";
import { useMobile } from "../../lib/use-mobile";
import { ColorPicker } from "../color-picker";

// sfc32 PRNG
function sfc32(a: number, b: number, c: number, d: number) {
  return function () {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

// returns an initialized random number generator
function prng(seed: number = 0xdeadbeef) {
  const r = sfc32(0x9e3779b9, 0x243f6a88, 0xb7e15162, seed);
  for (let i = 0; i < 20; i++) r();
  return r;
}

function randn(
  mu: number = 0,
  sigma: number = 1,
  rand: () => number = Math.random
) {
  let u1 = rand(),
    u2 = rand();
  // interval needs to be (0,1)
  while (u1 <= 0 || u1 >= 1) u1 = rand();
  return mu + sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export function Objects() {
  const { objects, mode, loading, changeModeParams } = useMobile();
  const [color, setColor] = useState<tc.Instance>(tc("#000"));
  const [selectedObject, setSelectedObject] = useState<number | null>(null);

  const objectSize = 48;
  const positions = useMemo(() => {
    // angle between elements (except first element)
    const angleSlice = (2 * Math.PI) / (objects.length - 1);

    const scaleX = 0.9;
    const scaleY = 0.75;
    const rand = prng(42);

    const positions = [{ top: "50%", left: "50%" }];
    for (let i = 1; i < objects.length; i++) {
      let angle =
        angleSlice / 2 +
        (i - 1) * angleSlice +
        randn(0, (Math.PI / 180) * 5, rand);
      let x =
        Math.round(Math.sin(angle) * 5000 * scaleX + randn(0, 2, rand)) / 100;
      let y =
        Math.round(Math.cos(angle) * 5000 * scaleY + randn(0, 2, rand)) / 100;
      positions.push({
        top: `${50 + y}%`,
        left: `${50 + x}%`,
      });
    }

    return positions;
  }, [objects.length]);

  const close = () => setSelectedObject(null);

  return (
    <>
      <Modal
        opened={selectedObject !== null}
        centered
        onClose={close}
        withCloseButton={false}
        classNames={{
          modal: "text-baby-blue bg-dark-blue rounded-xl",
          body: "flex flex-col items-center",
        }}
      >
        {selectedObject !== null && (
          <>
            <ColorPicker
              initialColor={objects[selectedObject].color}
              onChange={(newColor) => setColor(newColor)}
            />

            <Group position="right" mt="sm" className="self-stretch">
              <Button
                onClick={close}
                radius="xl"
                className="text-baby-blue hover:bg-baby-blue hover:text-dark-blue"
              >
                Back
              </Button>
              <Button
                radius="xl"
                className="bg-baby-blue text-dark-blue hover:text-baby-blue hover:bg-transparent"
                onClick={async () => {
                  await changeModeParams("SINGLE_COLOR", {
                    objects: [selectedObject],
                    color,
                  });
                  setSelectedObject(null);
                }}
              >
                Change color
              </Button>
            </Group>
          </>
        )}
      </Modal>

      <AspectRatio
        ratio={16 / 9}
        sx={{
          width: "100%",
          "@media (min-width: 768px)": {
            width: 768,
          },
          margin: "0 auto",
        }}
      >
        <div
          style={{
            padding: objectSize / 2 + 8,
          }}
        >
          <div className="relative w-full h-full">
            {objects.map((obj, id) => (
              <button
                key={id}
                style={{
                  position: "absolute",
                  ...positions[id],
                  width: objectSize,
                  height: objectSize,
                  transform: `translateX(-50%) translateY(-50%) translateZ(0)`,
                }}
                disabled={mode !== "SINGLE_COLOR" || loading}
                onClick={() => setSelectedObject(id)}
              >
                <obj.icon.icon
                  style={{
                    color: obj.color.toRgbString(),
                    width: objectSize,
                    height: objectSize,
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </AspectRatio>
    </>
  );
}
