import "server-only";

export async function createStripePortalSession(_params: unknown) {
  return "";
}

export async function createAccountPortalSession(_params: unknown) {
  return "";
}

export async function createPaymentMethodUpdateSession(_params: unknown) {
  return "";
}

export async function createStripeCancelSession(_params: unknown) {
  return "";
}

export async function createStripeSubscriptionUpdateConfirmation(
  _params: unknown,
) {
  return "";
}

export async function resumeSubscriptionRenewal(_params: unknown) {}

export async function resumeUserSubscriptionRenewals(_params?: unknown) {}

export async function stopUserSubscriptionRenewals(
  _params?: unknown,
): Promise<number> {
  return 0;
}

export async function cancelUserSubscriptions(_params?: unknown) {}

export async function deleteStripeCustomer(_params?: unknown) {}

export async function reconcileSubscriptions() {}
