import { BrowserWindow, Menu, shell, type MenuItemConstructorOptions } from "electron";
import type { Locale } from "../shared/i18n/types";
import { getDictionary } from "../shared/i18n";

export interface ApplicationMenuHandlers {
  onNewCustomAction: () => void;
  onNewScheduledTask: () => void;
  onSetLocale: (locale: Locale) => void;
}

export function buildApplicationMenu(
  locale: Locale,
  handlers: ApplicationMenuHandlers,
): Menu {
  const dictionary = getDictionary(locale);
  const template: MenuItemConstructorOptions[] = [
    {
      label: dictionary.menu.file,
      submenu: [
        {
          label: dictionary.menu.newCustomAction,
          accelerator: "CmdOrCtrl+N",
          click: handlers.onNewCustomAction,
        },
        {
          label: dictionary.menu.newScheduledTask,
          accelerator: "CmdOrCtrl+Shift+N",
          click: handlers.onNewScheduledTask,
        },
        { type: "separator" },
        { role: "quit", label: dictionary.menu.quit },
      ],
    },
    {
      label: dictionary.menu.view,
      submenu: [
        {
          label: dictionary.menu.language,
          submenu: [
            {
              label: dictionary.menu.languageEnglish,
              type: "radio",
              checked: locale === "en",
              click: () => handlers.onSetLocale("en"),
            },
            {
              label: dictionary.menu.languagePortuguese,
              type: "radio",
              checked: locale === "pt-BR",
              click: () => handlers.onSetLocale("pt-BR"),
            },
          ],
        },
      ],
    },
    {
      label: dictionary.menu.help,
      submenu: [
        {
          label: dictionary.menu.website,
          click: () => {
            void shell.openExternal("https://shellforge.app.br");
          },
        },
        {
          label: dictionary.menu.github,
          click: () => {
            void shell.openExternal("https://github.com/JooLuiz/shellforge");
          },
        },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}

export function setApplicationMenu(
  locale: Locale,
  handlers: ApplicationMenuHandlers,
): void {
  Menu.setApplicationMenu(buildApplicationMenu(locale, handlers));
}

export function sendLocaleChanged(browserWindow: BrowserWindow | null, locale: Locale): void {
  browserWindow?.webContents.send("locale:changed", locale);
}

export function sendAppCommand(
  browserWindow: BrowserWindow | null,
  channel: "app:newCustomAction" | "app:newScheduledTask",
): void {
  browserWindow?.webContents.send(channel);
}
