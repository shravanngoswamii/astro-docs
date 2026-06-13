import astroExpressiveCode, {
  type AstroExpressiveCodeOptions,
} from "astro-expressive-code";
import type { AstroIntegration } from "astro";

/**
 * Expressive Code configured for the docs aesthetic: dual light/dark themes
 * switched by `[data-theme]`, code background mapped to the `--docs-color-code-bg`
 * token, no opinionated frame shadow. Highlighting is build-time; the only client
 * JS is the optional copy button.
 */
export function docsExpressiveCode(
  userOptions: Record<string, unknown> | true,
): AstroIntegration[] {
  const overrides = typeof userOptions === "object" ? userOptions : {};
  const options: AstroExpressiveCodeOptions = {
    themes: ["github-light", "github-dark"],
    themeCssSelector: (theme) => `[data-theme="${theme.type}"]`,
    useDarkModeMediaQuery: false,
    styleOverrides: {
      codeBackground: "var(--docs-color-code-bg)",
      borderColor: "var(--docs-color-border)",
      borderRadius: "var(--docs-border-radius, 0)",
      frames: {
        shadowColor: "transparent",
      },
      ...(overrides.styleOverrides as object | undefined),
    },
    ...overrides,
  };
  return [astroExpressiveCode(options)];
}
