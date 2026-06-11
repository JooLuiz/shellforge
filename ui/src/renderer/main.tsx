import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { applyInitialTheme } from "./hooks/useTheme";
import "./styles/index.css";
import "reactflow/dist/style.css";

applyInitialTheme();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
