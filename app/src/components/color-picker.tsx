import iro from "@jaames/iro";
import tc from "tinycolor2";
import { useMemo } from "react";

import { useRef } from "react";
import { useEffect } from "react";
import { IroColorPicker } from "@jaames/iro/dist/ColorPicker";

export interface ColorPickerProps {
  initialColor: tc.Instance;
  onChange(color: tc.Instance): void | Promise<void>;
}

export function ColorPicker({ initialColor, onChange }: ColorPickerProps) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const pickerRef = useRef<IroColorPicker>(null);

  const changeHandler = useMemo(() => {
    const handler = (color: iro.Color) => {
      onChange(tc(color.rgba));
    };

    if (pickerRef.current) {
      pickerRef.current.off("color:change", changeHandler);
      pickerRef.current.on("color:change", handler);
    }

    return handler;
  }, [onChange]);

  useEffect(() => {
    if (nodeRef.current) {
      const picker: IroColorPicker = iro.ColorPicker(nodeRef.current, {
        color: initialColor.toRgbString(),
      });

      picker.on("color:change", changeHandler);
    }
  }, [nodeRef]);

  useEffect(() => {
    if (pickerRef.current) {
      pickerRef.current.setColors([new iro.Color(initialColor.toRgbString())]);
    }
  }, [initialColor]);

  return (
    <div>
      <div ref={nodeRef} />
    </div>
  );
}
