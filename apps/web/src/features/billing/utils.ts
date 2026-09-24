import type { SpaceTier } from "@/features/space/schema";

export function resolveSpaceTier(storedTier?: SpaceTier): SpaceTier {
  return storedTier ?? "pro";
}

export function isStripeErrorCode(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code
  );
}

export function isStripeResourceMissingError(error: unknown) {
  return isStripeErrorCode(error, "resource_missing");
}

export function isEarlySupporter(_params: unknown) {
  return false;
}

export function resolvePriceSet(_params: unknown): {
  monthly: null;
  yearly: null;
} {
  return { monthly: null, yearly: null };
}

export function formatMinorUnitAmount({
  amount,
  currency,
  locale,
}: {
  amount: number;
  currency: string;
  locale: string;
}) {
  const code = currency.toUpperCase();
  const minorUnitDigits =
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
    }).resolvedOptions().maximumFractionDigits ?? 2;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: minorUnitDigits,
  }).format(amount / 10 ** minorUnitDigits);
}

export function canChangeBillingInterval(_subscription: unknown) {
  return false;
}
