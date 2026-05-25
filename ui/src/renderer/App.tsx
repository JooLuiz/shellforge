import { useEffect, useMemo, useState } from "react";
import type { AppConfig, ProfileStatus, ScheduledTaskRecord } from "../shared/types";
import { PredefinedCommandsTab } from "./tabs/PredefinedCommandsTab";
import { ScheduledTasksTab } from "./tabs/ScheduledTasksTab";
import { CustomActionsTab } from "./tabs/CustomActionsTab";

type TabId = "predefined" | "custom" | "scheduled";

interface TabDefinition {
  id: TabId;
  label: string;
  title: string;
  description: string;
}

const TABS: TabDefinition[] = [
  {
    id: "predefined",
    label: "Pre-defined Commands",
    title: "Pre-defined Commands",
    description:
      "List of pre-defined commands to help guarantee a better experience when using Windows in CLI.",
  },
  {
    id: "custom",
    label: "Custom Actions",
    title: "Custom Actions",
    description: "List of configurable custom actions.",
  },
  {
    id: "scheduled",
    label: "Scheduled Tasks",
    title: "Scheduled Tasks",
    description: "List of tasks to be executed on pre-defined moments.",
  },
];

function getApiOrThrow() {
  if (!window.api || !window.api.config || !window.api.profile || !window.api.scheduledTasks) {
    throw new Error(
      "Desktop bridge unavailable (window.api). Restart the app after rebuilding the UI."
    );
  }
  return window.api;
}

export default function App(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>("predefined");
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(null);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTaskRecord[]>([]);
  const [customCreateRequestToken, setCustomCreateRequestToken] = useState(0);
  const [scheduledCreateRequestToken, setScheduledCreateRequestToken] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const activeTabDefinition = useMemo(
    () => TABS.find((tab) => tab.id === activeTab) ?? TABS[0],
    [activeTab]
  );

  const customActionCommandOptions = useMemo(() => {
    if (!config) {
      return [];
    }
    return Array.from(
      new Set(
        Object.entries(config.ui.customActions)
          .map(([actionName, customAction]) => customAction.aliases[0] ?? actionName)
          .filter((alias) => alias.trim().length > 0)
      )
    ).sort((leftAlias, rightAlias) => leftAlias.localeCompare(rightAlias));
  }, [config]);

  const loadInitialData = async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const appApi = getApiOrThrow();
      const [nextConfig, nextProfileStatus, nextScheduledTasks] = await Promise.all([
        appApi.config.read(),
        appApi.profile.status(),
        appApi.scheduledTasks.list(),
      ]);
      setConfig(nextConfig);
      setProfileStatus(nextProfileStatus);
      setScheduledTasks(nextScheduledTasks);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown load error";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadInitialData();
  }, []);

  const saveConfig = async (nextConfig: AppConfig): Promise<void> => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const appApi = getApiOrThrow();
      await appApi.config.write(nextConfig);
      await appApi.profile.regenerate();
      const nextProfileStatus = await appApi.profile.status();
      setConfig(nextConfig);
      setProfileStatus(nextProfileStatus);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown save error";
      setErrorMessage(message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const refreshScheduledTasks = async (): Promise<void> => {
    const appApi = getApiOrThrow();
    const nextTasks = await appApi.scheduledTasks.list();
    setScheduledTasks(nextTasks);
  };

  const tabHeaderAction =
    activeTab === "custom" ? (
      <button
        type="button"
        className="button button-teal"
        onClick={() => setCustomCreateRequestToken((previousToken) => previousToken + 1)}
      >
        New Action
      </button>
    ) : activeTab === "scheduled" ? (
      <button
        type="button"
        className="button button-teal"
        onClick={() => setScheduledCreateRequestToken((previousToken) => previousToken + 1)}
      >
        New Schedule
      </button>
    ) : null;

  return (
    <div className="app-page">
      <div className="window-frame">
        <header className="window-header">
          <h1>(Logo) WCC</h1>
          <nav className="tab-row" aria-label="Main app sections">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={tab.id === activeTab ? "tab-button active" : "tab-button"}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        <section className="tab-header">
          <div>
            <h2>{activeTabDefinition.title}</h2>
            <p>{activeTabDefinition.description}</p>
            {profileStatus ? (
              <small className="profile-caption">
                Profile: {profileStatus.profilePath} (
                {profileStatus.blockPresent ? "managed block found" : "managed block missing"})
              </small>
            ) : null}
          </div>
          <div className="tab-header-actions">{tabHeaderAction}</div>
        </section>

        <div className="tab-content-scroll">
          {isLoading ? <div className="info-banner">Loading desktop manager...</div> : null}
          {!config && !isLoading ? <div className="error-banner">Failed to load config.</div> : null}
          {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

          {config ? (
            <main className="main-content">
              {activeTab === "predefined" ? (
                <PredefinedCommandsTab config={config} onSave={saveConfig} />
              ) : null}
              {activeTab === "custom" ? (
                <CustomActionsTab
                  config={config}
                  onSave={saveConfig}
                  createRequestToken={customCreateRequestToken}
                  onCreateRequestConsumed={() => setCustomCreateRequestToken(0)}
                />
              ) : null}
              {activeTab === "scheduled" ? (
                <ScheduledTasksTab
                  scheduledTasks={scheduledTasks}
                  refreshScheduledTasks={refreshScheduledTasks}
                  commandOptions={customActionCommandOptions}
                  createRequestToken={scheduledCreateRequestToken}
                  onCreateRequestConsumed={() => setScheduledCreateRequestToken(0)}
                />
              ) : null}
            </main>
          ) : null}
        </div>

        <footer className="app-footer">
          <span>Copyright 2026 (place a better message here)</span>
          <div className="footer-links">
            <a href="https://www.google.com/chrome/" target="_blank" rel="noreferrer">
              Chrome
            </a>
            <a href="https://github.com/" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </footer>
      </div>
      {isSaving ? <div className="saving-chip">Saving...</div> : null}
    </div>
  );
}
