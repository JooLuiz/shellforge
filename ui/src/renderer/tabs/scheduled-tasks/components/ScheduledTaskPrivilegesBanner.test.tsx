// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "../../../i18n";
import { ScheduledTaskPrivilegesBanner } from "./ScheduledTaskPrivilegesBanner";

describe("ScheduledTaskPrivilegesBanner", () => {
  it("renders the administrator warning when visible", () => {
    render(
      <I18nProvider>
        <ScheduledTaskPrivilegesBanner isVisible={true} />
      </I18nProvider>,
    );

    expect(screen.getByText("Administrator privileges required")).toBeInTheDocument();
    expect(
      screen.getByText(
        "ShellForge cannot enable or disable Windows scheduled tasks while running without administrator privileges.",
      ),
    ).toBeInTheDocument();
  });

  it("renders nothing when hidden", () => {
    render(
      <I18nProvider>
        <ScheduledTaskPrivilegesBanner isVisible={false} />
      </I18nProvider>,
    );

    expect(screen.queryByText("Administrator privileges required")).not.toBeInTheDocument();
  });
});
