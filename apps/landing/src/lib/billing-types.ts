export type PriceAmounts = Record<string, number>;

export type PricesByCurrency = Record<
  string,
  {
    monthly: number;
    yearly: number;
    monthlyPerMonth: number;
    yearlyPerMonth: number;
  }
>;

export const PLAN_NAMES = {
  hobby: "Free",
  pro: "Pro",
  HOBBY: "Free",
  PRO: "Pro",
} as const;

export function yearlySavingsPercent(_amounts?: unknown): number {
  return 20;
}

export const CURRENCY_COOKIE_NAME = "currency";

export const displayedCurrencies = ["usd", "eur", "gbp"] as const;

export function getCountryCurrency(
  _country?: string,
  _available?: readonly string[],
): string {
  return "usd";
}

export const pricingData = {
  monthly: { currency: "usd", amount: 0 },
  yearly: { currency: "usd", amount: 0 },
};

export function createStripeClient(_options?: unknown): null {
  return null;
}

export async function getProPricing(_options?: unknown): Promise<{
  currencies: Record<
    string,
    {
      monthly: number;
      yearly: number;
      monthlyPerMonth: number;
      yearlyPerMonth: number;
    }
  >;
}> {
  return {
    currencies: {
      usd: {
        monthly: 0,
        yearly: 0,
        monthlyPerMonth: 0,
        yearlyPerMonth: 0,
      },
    },
  };
}
