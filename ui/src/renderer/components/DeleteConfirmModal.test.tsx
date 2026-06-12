/**
 * @vitest-environment happy-dom
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../i18n";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

function renderDeleteModal(locale: "en" | "pt-BR" = "en"): void {
  window.api = {
    locale: {
      sync: vi.fn(),
      onChanged: vi.fn(() => vi.fn()),
    },
  } as unknown as typeof window.api;

  render(
    <I18nProvider>
      <DeleteConfirmModal
        closeDeleteModal={vi.fn()}
        confirmDelete={vi.fn(async () => undefined)}
        errorMessage={null}
        isDeleting={false}
        itemName="fetchData"
        variant="customAction"
      />
    </I18nProvider>,
  );

  if (locale === "pt-BR") {
    localStorage.setItem("shell-forge-locale", "pt-BR");
  }
}

describe("DeleteConfirmModal", () => {
  it("renders localized English copy for custom actions", () => {
    localStorage.setItem("shell-forge-locale", "en");
    renderDeleteModal("en");

    expect(screen.getByRole("heading", { name: "Delete action fetchData?" })).toBeTruthy();
    expect(
      screen.getByText("This permanently removes the action from your config. This cannot be undone."),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy();
  });

  it("renders localized Portuguese copy for custom actions", () => {
    localStorage.setItem("shell-forge-locale", "pt-BR");

    window.api = {
      locale: {
        sync: vi.fn(),
        onChanged: vi.fn(() => vi.fn()),
      },
    } as unknown as typeof window.api;

    render(
      <I18nProvider>
        <DeleteConfirmModal
          closeDeleteModal={vi.fn()}
          confirmDelete={vi.fn(async () => undefined)}
          errorMessage={null}
          isDeleting={false}
          itemName="fetchData"
          variant="customAction"
        />
      </I18nProvider>,
    );

    expect(screen.getByRole("heading", { name: "Excluir ação fetchData?" })).toBeTruthy();
    expect(
      screen.getByText(
        "Isso remove permanentemente a ação da sua configuração. Esta ação não pode ser desfeita.",
      ),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Excluir" })).toBeTruthy();
  });

  it("shows an error banner when delete fails", () => {
    localStorage.setItem("shell-forge-locale", "en");

    window.api = {
      locale: {
        sync: vi.fn(),
        onChanged: vi.fn(() => vi.fn()),
      },
    } as unknown as typeof window.api;

    render(
      <I18nProvider>
        <DeleteConfirmModal
          closeDeleteModal={vi.fn()}
          confirmDelete={vi.fn(async () => undefined)}
          errorMessage="Unable to delete action."
          isDeleting={false}
          itemName="fetchData"
          variant="customAction"
        />
      </I18nProvider>,
    );

    expect(screen.getByText("Unable to delete action.")).toBeTruthy();
  });

  it("uses distinct button styles for cancel and delete actions", () => {
    localStorage.setItem("shell-forge-locale", "en");

    window.api = {
      locale: {
        sync: vi.fn(),
        onChanged: vi.fn(() => vi.fn()),
      },
    } as unknown as typeof window.api;

    render(
      <I18nProvider>
        <DeleteConfirmModal
          closeDeleteModal={vi.fn()}
          confirmDelete={vi.fn(async () => undefined)}
          errorMessage={null}
          isDeleting={false}
          itemName="fetchData"
          variant="customAction"
        />
      </I18nProvider>,
    );

    expect(screen.getByRole("button", { name: "Cancel" }).className).toContain("button-ghost");
    expect(screen.getByRole("button", { name: "Delete" }).className).toContain("button-red");
  });
});
