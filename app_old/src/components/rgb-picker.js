import React, { useState } from 'react'
import ReinventedColorWheel from 'reinvented-color-wheel/react'
import 'reinvented-color-wheel/css/reinvented-color-wheel.min.css'

export default function RgbPicker({ color, onChange }) {
  const [col, setCol] = useState([color?.r || 0, color?.g || 0, color?.b || 0]);

  return (
    <ReinventedColorWheel
      rgb={col}
      wheelDiameter={256}
      wheelThickness={32}
      handleDiameter={28}
      wheelReflectsSaturation={false}
      onChange={({ rgb }) => {
        setCol(rgb);
        onChange({ r: rgb[0], g: rgb[1], b: rgb[2] });
      }}
    />
  )
}