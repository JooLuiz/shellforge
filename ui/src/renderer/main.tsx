/*
 * Copyright (C) 2026 João Luiz de Castro
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppCommandBridgeProvider } from "./context/AppCommandBridge";
import { applyInitialTheme } from "./hooks/useTheme";
import { I18nProvider } from "./i18n";
import "./styles/index.css";
import "reactflow/dist/style.css";

applyInitialTheme();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <I18nProvider>
      <AppCommandBridgeProvider>
        <App />
      </AppCommandBridgeProvider>
    </I18nProvider>
  </React.StrictMode>,
);
