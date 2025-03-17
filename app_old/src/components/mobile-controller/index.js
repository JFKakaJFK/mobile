import React from 'react';
import { ColorProvider } from "../../util/color-provider";
import MobileConnection from "./mobile-connection";
import MobileRemote from "./remote";

export default function MobileController() {
  return (
    <MobileConnection>
      <ColorProvider>
        <MobileRemote />
      </ColorProvider>
    </MobileConnection>
  )
}