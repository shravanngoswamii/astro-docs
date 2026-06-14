import en from "../translations/en.json";

export type UIStrings = typeof en;
export type UIKey = keyof UIStrings;

/**
 * Returns a translation getter. v1 ships English only; the signature accepts a
 * locale so multi-locale support can be added without changing call sites.
 */
export function useTranslations(_locale?: string) {
	return function t(key: UIKey): string {
		return en[key] ?? key;
	};
}
