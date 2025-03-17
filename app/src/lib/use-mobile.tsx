import {
  BleClient,
  BleDevice,
  numbersToDataView /*,numberToUUID*/,
} from "@capacitor-community/bluetooth-le";
import { Storage } from "@capacitor/storage";
import {
  createContext,
  ReactNode,
  SVGProps,
  useContext,
  useEffect,
  useState,
} from "react";
import tinycolor, { Instance } from "tinycolor2";
import {
  Meteorite,
  Moon,
  Planet,
  Rocket,
  Satellite,
  Saturn,
  Sun,
} from "./icons";
import { useBLE } from "./use-ble";

function numberToUUID(value: number) {
  return `0000${value
    .toString(16)
    .padStart(4, "0")}-0000-1000-8000-00805f9b34fb`;
}

export const MOBILE_SERVICE = "19b10000-e8f2-537e-4f6c-d104768a1214";

export const MOBILE_READ_STATE = numberToUUID(0x0001);
export const MOBILE_SET_STATE = numberToUUID(0x0002);

export const MOBILE_READ_COLORS = numberToUUID(0x0003);
export const MOBILE_CHANGE_COLORS = numberToUUID(0x0004);
export const MOBILE_READ_MODE = numberToUUID(0x0005);

export enum MobileState {
  ON = "On",
  OFF = "Off",
}

export interface MobileIcon {
  name: string;
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
}

export const ICONS: MobileIcon[] = [
  { name: "Sun", icon: Sun },
  { name: "Planet", icon: Planet },
  { name: "Satellite", icon: Satellite },
  { name: "Saturn", icon: Saturn },
  { name: "Moon", icon: Moon },
  { name: "Meteorite", icon: Meteorite },
  { name: "Rocket", icon: Rocket },
];

export interface Object {
  color: Instance; // managed by actual Mobile
  icon: MobileIcon; // visual sugar, managed by useMobile hook
}

// conversion between indices and one-hot encoding
const id2idx = (id: number) => Math.log2(id);
const idx2id = (idx: number) => 1 << idx;

const defaultObjects: Object[] = [
  {
    color: tinycolor("#000"),
    icon: ICONS[0],
  },
  {
    color: tinycolor("#000"),
    icon: ICONS[1],
  },
  {
    color: tinycolor("#000"),
    icon: ICONS[2],
  },
  {
    color: tinycolor("#000"),
    icon: ICONS[3],
  },
  {
    color: tinycolor("#000"),
    icon: ICONS[4],
  },
  {
    color: tinycolor("#000"),
    icon: ICONS[5],
  },
  {
    color: tinycolor("#000"),
    icon: ICONS[6],
  },
];

const modeId = {
  SINGLE_COLOR: 0x00,
  RAINBOW: 0x01,
  COLOR_ROTATE: 0x02,
};

export interface ChangeColorInput {
  SINGLE_COLOR: {
    objects: number[];
    color: Instance;
  };
  RAINBOW: {
    direction: boolean;
    rotationsToDirectionChange: number; // 0 is never change
    duration: number;
  };
  COLOR_ROTATE: {
    fade: boolean;
    duration: number;
  };
}

export type Mode = keyof typeof modeId extends keyof ChangeColorInput
  ? keyof ChangeColorInput extends keyof typeof modeId
    ? keyof typeof modeId
    : never
  : never;
// Make sure that the input types are defined for the
// TODO find better way to ensure type correctness
// maybe https://github.com/Microsoft/dtslint
const _typecheckMode: Mode extends never ? never : true = true;

const defaultModeParams = {
  SINGLE_COLOR: {
    objects: [],
    color: tinycolor("#000"),
  },
  RAINBOW: {
    direction: true,
    rotationsToDirectionChange: 3, // never change
    duration: 5000, // 5s
  },
  COLOR_ROTATE: {
    fade: false,
    duration: 7000, // 1s per object
  },
};

const id2mode = (id: number): Mode => {
  return (Object.keys(modeId).find((mode) => id === modeId[mode as Mode]) ||
    "SINGLE_COLOR") as Mode;
};

export const Modes: Mode[] = Object.keys(modeId) as Mode[];

export type ModeInput<M extends Mode> = ChangeColorInput[M];

export interface MobileContext {
  // general
  loading: boolean;
  error: string | null;
  // ble stuff
  connected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  // mobile stuff
  state: MobileState;
  toggleState(): Promise<void>;
  mode: Mode;
  changeMode(mode: Mode): Promise<void>;
  objects: Object[];
  changeModeParams<M extends Mode>(
    mode: M,
    params: ChangeColorInput[M]
  ): Promise<void>;
  selectIcon(index: number, icon: MobileIcon): Promise<void>;
}

const MobileContext = createContext<MobileContext>(
  {} as unknown as MobileContext
);
export interface MobileProviderProps {
  children?: ReactNode;
}
export function MobileProvier({ children }: MobileProviderProps) {
  // on/off
  const [state, setState] = useState<MobileState>(MobileState.OFF);
  const [mode, setMode] = useState<Mode>("SINGLE_COLOR");
  // array of objects
  const [objects, setObjects] = useState<Object[]>(defaultObjects);
  // BLE connection
  const { loading, error, connected, paired, pair, unpair, withBLE } = useBLE({
    requestDeviceOptions: {
      services: [MOBILE_SERVICE],
    },
    async onConnect(mobile) {
      // read mobile state once
      await update(mobile);
      // subscribe to new mobile data
      await BleClient.startNotifications(
        mobile.deviceId,
        MOBILE_SERVICE,
        MOBILE_READ_STATE,
        updateState
      );
      await BleClient.startNotifications(
        mobile.deviceId,
        MOBILE_SERVICE,
        MOBILE_READ_MODE,
        updateMode
      );
      await BleClient.startNotifications(
        mobile.deviceId,
        MOBILE_SERVICE,
        MOBILE_READ_COLORS,
        updateObjects
      );
    }, // TODO do I need to stopNoftifications somewhere?
  });

  async function update(mobile: BleDevice) {
    // read state
    const stateView = await BleClient.read(
      mobile.deviceId,
      MOBILE_SERVICE,
      MOBILE_READ_STATE
    );
    updateState(stateView);
    // read mode
    const modeView = await BleClient.read(
      mobile.deviceId,
      MOBILE_SERVICE,
      MOBILE_READ_MODE
    );
    updateMode(modeView);
    // read colors
    const colorsView = await BleClient.read(
      mobile.deviceId,
      MOBILE_SERVICE,
      MOBILE_READ_COLORS
    );
    updateObjects(colorsView);
  }

  const updateState = (stateView: DataView) =>
    setState(stateView.getUint8(0) > 0 ? MobileState.ON : MobileState.OFF);
  const updateMode = (modeView: DataView) =>
    setMode(id2mode(modeView.getUint8(0)));
  const updateObjects = (colorsView: DataView) =>
    setObjects(
      [...new Array(colorsView.byteLength / 3)].map((_, i) => {
        const obj =
          i >= objects.length
            ? {
                color: tinycolor("#000"),
                icon: ICONS[0],
              }
            : objects[i];

        // update color
        obj.color = tinycolor({
          r: colorsView.getUint8(3 * i),
          g: colorsView.getUint8(3 * i + 1),
          b: colorsView.getUint8(3 * i + 2),
        });

        return obj;
      })
    );

  // get icons from storage on load
  useEffect(() => {
    // get obj icons from local storage
    Promise.all(
      objects.map(async (obj, id) => {
        const { value } = await Storage.get({ key: id.toString() });
        const icon = ICONS.find((i) => i.name === value);
        if (icon) {
          obj.icon = icon;
        }
        return obj;
      })
    ).then(setObjects);
  }, []);

  async function changeModeParams<M extends Mode>(
    mode: M,
    params: ModeInput<M>
  ) {
    let payload: DataView | null = null;
    switch (mode) {
      case "SINGLE_COLOR":
        {
          // Should be able to infer the params type somehow :/
          const { objects, color } = params as ModeInput<"SINGLE_COLOR">;
          const objs = objects.reduce((acc, idx) => acc | idx2id(idx), 0);
          const { r, g, b } = color.toRgb();

          payload = new DataView(
            Uint8Array.from([modeId[mode], objs, r, g, b]).buffer
          );
        }
        break;
      case "RAINBOW":
        {
          const { direction, rotationsToDirectionChange, duration } =
            params as ModeInput<"RAINBOW">;
          const d = duration / 100;
          payload = new DataView(
            Uint8Array.from([
              modeId[mode],
              +direction,
              rotationsToDirectionChange,
              d >> 8,
              d,
            ]).buffer
          );
        }
        break;
      case "COLOR_ROTATE":
        {
          const { fade, duration } = params as ModeInput<"COLOR_ROTATE">;
          const d = duration / 100;
          payload = new DataView(
            Uint8Array.from([modeId[mode], +fade, d >> 8, d]).buffer
          );
        }
        break;
    }
    if (payload !== null) {
      await withBLE(
        async (mobile) =>
          await BleClient.write(
            mobile.deviceId,
            MOBILE_SERVICE,
            MOBILE_CHANGE_COLORS,
            payload as DataView
          )
      );
    }
  }

  return (
    <MobileContext.Provider
      value={{
        loading,
        error,
        connected: connected && paired,
        connect: pair,
        disconnect: unpair,
        state,
        async toggleState() {
          await withBLE(
            async (mobile) =>
              await BleClient.write(
                mobile.deviceId,
                MOBILE_SERVICE,
                MOBILE_SET_STATE,
                numbersToDataView([state === MobileState.ON ? 0 : 1])
              )
          );
        },
        objects,
        changeModeParams,
        mode,
        async changeMode(mode: Mode) {
          await changeModeParams(mode, defaultModeParams[mode]);
        },
        async selectIcon(idx, icon) {
          setObjects(
            objects.map((obj, i) => {
              if (i === idx) {
                obj.icon = icon;
              }
              return obj;
            })
          );
          // update stored icon for this object
          Storage.set({
            key: idx.toString(),
            value: icon.name,
          });
        },
      }}
    >
      {children}
    </MobileContext.Provider>
  );
}

export const useMobile = () => useContext(MobileContext);
