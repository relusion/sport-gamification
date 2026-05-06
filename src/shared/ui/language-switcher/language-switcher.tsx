"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

import { LOCALES, LOCALE_COOKIE_NAME, type Locale, isLocale } from "@/shared/i18n/config";
import { cn } from "@/shared/lib/cn";

const LABELS: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
};

const SHORT: Record<Locale, string> = {
  en: "EN",
  ru: "RU",
};

export interface LanguageSwitcherProps {
  currentLocale: Locale;
  className?: string;
}

function setLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  const oneYear = 60 * 60 * 24 * 365;
  // Secure on https only — defence-in-depth against accidental http downgrade.
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${oneYear}; samesite=lax${secure}`;
}

export function swapLocaleSegment(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isLocale(segments[0])) {
    segments[0] = nextLocale;
  } else {
    segments.unshift(nextLocale);
  }
  return "/" + segments.join("/");
}

export function LanguageSwitcher({ currentLocale, className }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  const handleSelect = useCallback(
    (next: Locale) => {
      setLocaleCookie(next);
      router.push(swapLocaleSegment(pathname, next));
    },
    [pathname, router],
  );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`Language: ${LABELS[currentLocale]}`}
          className={cn(
            "inline-flex min-h-(--hit-min) items-center gap-2",
            "rounded-(--radius-md) border border-(--color-border) bg-(--color-surface)",
            "px-3 text-sm text-(--color-ink)",
            "hover:bg-(--color-surface-muted)",
            "focus-visible:outline focus-visible:outline-(length:--focus-ring-width)",
            "focus-visible:outline-(--color-focus-ring) focus-visible:outline-offset-(--focus-ring-offset)",
            className,
          )}
        >
          <span aria-hidden="true">🌐</span>
          <span>{SHORT[currentLocale]}</span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className={cn(
            "z-50 min-w-[8rem] rounded-(--radius-md) border border-(--color-border)",
            "bg-(--color-surface) p-1 shadow-[var(--shadow-card)]",
          )}
        >
          {LOCALES.map((locale) => (
            <DropdownMenu.Item
              key={locale}
              onSelect={() => handleSelect(locale)}
              className={cn(
                "flex min-h-(--hit-min) cursor-pointer items-center rounded-(--radius-sm) px-3 text-sm",
                "outline-none data-[highlighted]:bg-(--color-surface-muted)",
                "data-[highlighted]:text-(--color-ink)",
              )}
              data-current={locale === currentLocale ? "true" : undefined}
            >
              {LABELS[locale]}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
