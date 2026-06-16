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

import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import { I18nProvider } from "./i18n";
import ActionStepsPage from "./pages/ActionSteps";
import ConfigurationPage from "./pages/Configuration";
import DesktopUiPage from "./pages/DesktopUi";
import GettingStartedPage from "./pages/GettingStarted";
import HomePage from "./pages/Home";
import PredefinedCommandsPage from "./pages/PredefinedCommands";

const THEME_STORAGE_KEY = "shellforge-page-theme";

function readThemePreference(): "dark" | "light" {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "dark" || stored === "light") {
    return stored;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const App = () => {
  const [theme, setTheme] = useState<"dark" | "light">(readThemePreference);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <I18nProvider>
      <Layout theme={theme} setTheme={setTheme}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/getting-started" element={<GettingStartedPage />} />
          <Route path="/desktop-ui" element={<DesktopUiPage />} />
          <Route path="/action-steps" element={<ActionStepsPage />} />
          <Route path="/predefined-commands" element={<PredefinedCommandsPage />} />
          <Route path="/configuration" element={<ConfigurationPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </I18nProvider>
  );
};

export default App;
