import Cookies from "js-cookie";
import { CURRENCY_COOKIE_NAME } from "@/lib/billing-types";

export { CURRENCY_COOKIE_NAME };

export const currencyCookieAttributes = {
  path: "/",
  sameSite: "lax",
  domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined,
  expires: 365,
} as const;

export function readCurrencyCookie() {
  const value = Cookies.get(CURRENCY_COOKIE_NAME);
  return value && /^[a-z]{3}$/.test(value) ? value : undefined;
}

export function writeCurrencyCookie(currency: string) {
  Cookies.set(CURRENCY_COOKIE_NAME, currency, currencyCookieAttributes);
}
