import "server-only";

import { cache } from "react";

export const loadPayWallPricing = cache(async () => {
  return null;
});

export const loadSubscriptionOverview = cache(async () => {
  return null;
});

export const loadPaymentMethods = cache(async () => {
  return [];
});

export const loadIsSubscriptionPastDue = cache(async () => {
  return false;
});
