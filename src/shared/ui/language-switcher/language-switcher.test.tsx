import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { LanguageSwitcher } from "./language-switcher";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => "/en/quiz",
}));

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    pushMock.mockReset();
    document.cookie = "movequest_locale=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  });

  afterEach(() => {
    document.cookie = "movequest_locale=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  });

  it("renders a trigger button with current locale label", () => {
    render(<LanguageSwitcher currentLocale="en" />);
    expect(screen.getByRole("button", { name: /language/i })).toBeInTheDocument();
  });

  it("opens the menu and routes to the chosen locale and writes the cookie", async () => {
    render(<LanguageSwitcher currentLocale="en" />);
    const trigger = screen.getByRole("button", { name: /language/i });

    await userEvent.click(trigger);
    const ruOption = await screen.findByRole("menuitem", { name: /русский/i });
    await userEvent.click(ruOption);

    expect(pushMock).toHaveBeenCalledWith("/ru/quiz");
    expect(document.cookie).toMatch(/movequest_locale=ru/);
  });

  it("trigger is keyboard-operable (Enter opens menu)", async () => {
    render(<LanguageSwitcher currentLocale="en" />);
    const trigger = screen.getByRole("button", { name: /language/i });
    trigger.focus();
    expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(await screen.findByRole("menuitem", { name: /english/i })).toBeInTheDocument();
  });
});
