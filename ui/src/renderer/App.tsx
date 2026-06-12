import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AppConfig,
  ProfileStatus,
  ScheduledTaskRecord,
} from "../shared/types";
import { AppFooter } from "./components/AppFooter";
import { ProfileHealthBanner } from "./components/ProfileHealthBanner";
import { TabHeaderSearch } from "./components/TabHeaderSearch";
import { useAppCommandBridge } from "./context/AppCommandBridge";
import { useTheme } from "./hooks/useTheme";
import { useTranslation } from "./i18n";
import { CustomActionsTab } from "./tabs/CustomActionsTab";
import { PredefinedCommandsTab } from "./tabs/PredefinedCommandsTab";
import { PredefinedCommandFilters } from "./tabs/predefined-commands/PredefinedCommandFilters";
import type { PredefinedCommandFilterCategory } from "./tabs/predefined-commands/predefinedCommandFilterUtils";
import { ScheduledTasksTab } from "./tabs/ScheduledTasksTab";
import { buildCliAvailableCommandOptions } from "./tabs/scheduled-tasks/utils";
import shellForgeMark from "./assets/logo/shell-forge-mark.svg";

type TabId = "predefined" | "custom" | "scheduled";
type ScheduledTasksLoadStatus = "idle" | "loading" | "loaded" | "error";

function getApiOrThrow() {
  if (
    !window.api ||
    !window.api.config ||
    !window.api.profile ||
    !window.api.scheduledTasks
  ) {
    throw new Error("Desktop bridge unavailable");
  }
  return window.api;
}

export default function App(): JSX.Element {
  const { t } = useTranslation();
  const { requestCustomActionCreate, requestScheduledTaskCreate } = useAppCommandBridge();
  const [activeTab, setActiveTab] = useState<TabId>("predefined");
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(null);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTaskRecord[]>([]);
  const [scheduledTasksLoadStatus, setScheduledTasksLoadStatus] =
    useState<ScheduledTasksLoadStatus>("idle");
  const [scheduledTasksLoadError, setScheduledTasksLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [tabSearchQuery, setTabSearchQuery] = useState("");
  const [predefinedCategoryFilter, setPredefinedCategoryFilter] =
    useState<PredefinedCommandFilterCategory>("all");
  const { setTheme, theme } = useTheme();

  const tabDefinitions = useMemo(
    () => [
      {
        id: "predefined" as const,
        label: t.tabs.predefined,
        title: t.tabs.predefinedTitle,
        description: t.tabs.predefinedDescription,
      },
      {
        id: "custom" as const,
        label: t.tabs.custom,
        title: t.tabs.customTitle,
        description: t.tabs.customDescription,
      },
      {
        id: "scheduled" as const,
        label: t.tabs.scheduled,
        title: t.tabs.scheduledTitle,
        description: t.tabs.scheduledDescription,
      },
    ],
    [t],
  );

  const activeTabDefinition = useMemo(
    () => tabDefinitions.find((tab) => tab.id === activeTab) ?? tabDefinitions[0],
    [activeTab, tabDefinitions],
  );

  const customActionCommandOptions = useMemo(() => {
    if (!config) {
      return [];
    }
    return buildCliAvailableCommandOptions(config.ui.customActions);
  }, [config]);

  const loadInitialData = async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const appApi = getApiOrThrow();
      const [nextConfig, nextProfileStatus] = await Promise.all([
        appApi.config.read(),
        appApi.profile.status(),
      ]);
      setConfig(nextConfig);
      setProfileStatus(nextProfileStatus);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t.app.unknownLoadError;
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadInitialData();
  }, []);

  const refreshProfileStatus = async (): Promise<void> => {
    const appApi = getApiOrThrow();
    const nextProfileStatus = await appApi.profile.status();
    setProfileStatus(nextProfileStatus);
  };

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
      const message =
        error instanceof Error ? error.message : t.app.unknownSaveError;
      setErrorMessage(message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const refreshScheduledTasks = useCallback(async (): Promise<void> => {
    setScheduledTasksLoadStatus("loading");
    setScheduledTasksLoadError(null);
    try {
      const appApi = getApiOrThrow();
      const nextTasks = await appApi.scheduledTasks.list();
      setScheduledTasks(nextTasks);
      setScheduledTasksLoadStatus("loaded");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t.app.unknownScheduledTasksLoadError;
      setScheduledTasksLoadError(message);
      setScheduledTasksLoadStatus("error");
      throw error;
    }
  }, [t.app.unknownScheduledTasksLoadError]);

  useEffect(() => {
    if (activeTab !== "scheduled" || scheduledTasksLoadStatus !== "idle") {
      return;
    }

    void refreshScheduledTasks().catch(() => {
      // Error state is already set inside refreshScheduledTasks.
    });
  }, [activeTab, refreshScheduledTasks, scheduledTasksLoadStatus]);

  useEffect(() => {
    setTabSearchQuery("");
    setPredefinedCategoryFilter("all");
  }, [activeTab]);

  const tabSearchPlaceholder =
    activeTab === "predefined"
      ? t.app.searchPredefined
      : activeTab === "custom"
        ? t.app.searchCustomActions
        : t.app.searchScheduledTasks;

  const tabHeaderAction =
    activeTab === "custom" ? (
      <button
        type="button"
        className="button button-teal"
        onClick={() => {
          setActiveTab("custom");
          requestCustomActionCreate();
        }}
      >
        {t.app.newAction}
      </button>
    ) : activeTab === "scheduled" ? (
      <button
        type="button"
        className="button button-teal"
        onClick={() => {
          setActiveTab("scheduled");
          requestScheduledTaskCreate();
        }}
      >
        {t.app.newSchedule}
      </button>
    ) : null;

  return (
    <div className="app-page">
      <div className="window-frame">
        <header className="window-header">
          <div className="brand-block">
            <img
              src={shellForgeMark}
              alt="ShellForge mark"
              className="brand-mark"
            />
            <div className="brand-copy">
              <h1 className="brand-heading">{t.app.brandTitle}</h1>
            </div>
          </div>
          <nav className="tab-row" aria-label="Main app sections">
            {tabDefinitions.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={
                  tab.id === activeTab ? "tab-button active" : "tab-button"
                }
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        <section className="tab-header">
          <div className="tab-header-top">
            <div>
              <h2>{activeTabDefinition.title}</h2>
              <p>{activeTabDefinition.description}</p>
            </div>
            <div className="tab-header-actions">
              <TabHeaderSearch
                value={tabSearchQuery}
                onChange={setTabSearchQuery}
                placeholder={tabSearchPlaceholder}
              />
              {tabHeaderAction}
            </div>
          </div>
          {activeTab === "predefined" ? (
            <div className="tab-header-filters">
              <PredefinedCommandFilters
                activeCategory={predefinedCategoryFilter}
                onCategoryChange={setPredefinedCategoryFilter}
              />
            </div>
          ) : null}
        </section>

        <div className="tab-content-scroll">
          {isLoading ? <div className="info-banner">{t.app.loading}</div> : null}
          {!config && !isLoading ? (
            <div className="error-banner">{t.app.failedToLoadConfig}</div>
          ) : null}
          {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

          {profileStatus ? (
            <ProfileHealthBanner
              profileStatus={profileStatus}
              isSaving={isSaving}
              onRegenerate={async () => {
                setErrorMessage(null);
                try {
                  const appApi = getApiOrThrow();
                  await appApi.profile.regenerate();
                  await refreshProfileStatus();
                } catch (error) {
                  const message =
                    error instanceof Error ? error.message : t.app.regenerateProfileFailed;
                  setErrorMessage(message);
                }
              }}
              onOpenFolder={async () => {
                const appApi = getApiOrThrow();
                await appApi.profile.openFolder();
              }}
            />
          ) : null}

          {config ? (
            <main className="main-content">
              {activeTab === "predefined" ? (
                <PredefinedCommandsTab
                  config={config}
                  onSave={saveConfig}
                  searchQuery={tabSearchQuery}
                  categoryFilter={predefinedCategoryFilter}
                />
              ) : null}
              {activeTab === "custom" ? (
                <CustomActionsTab
                  config={config}
                  onSave={saveConfig}
                  searchQuery={tabSearchQuery}
                />
              ) : null}
              {activeTab === "scheduled" ? (
                <ScheduledTasksTab
                  actionRunner={config.actionRunner}
                  customActions={config.ui.customActions}
                  scheduledTasks={scheduledTasks}
                  refreshScheduledTasks={refreshScheduledTasks}
                  isLoadingScheduledTasks={
                    scheduledTasksLoadStatus === "loading"
                  }
                  scheduledTasksLoadError={scheduledTasksLoadError}
                  commandOptions={customActionCommandOptions}
                  searchQuery={tabSearchQuery}
                />
              ) : null}
            </main>
          ) : null}
        </div>

        <AppFooter setTheme={setTheme} theme={theme} />
      </div>
      {isSaving ? <div className="saving-chip">{t.app.saving}</div> : null}
    </div>
  );
}
