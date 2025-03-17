import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

import "./lib/i18n";
import { MobileProvier } from "./lib/use-mobile";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";

ReactDOM.render(
  <React.StrictMode>
    <MantineProvider>
      <NotificationsProvider position="top-center" limit={5}>
        <MobileProvier>
          <App />
        </MobileProvier>
      </NotificationsProvider>
    </MantineProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
