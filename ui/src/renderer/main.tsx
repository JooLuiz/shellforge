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
