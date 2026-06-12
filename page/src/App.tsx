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
