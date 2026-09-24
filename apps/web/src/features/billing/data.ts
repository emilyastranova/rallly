import "server-only";

export async function getSpaceSubscription(_spaceId: string) {
  return null;
}

export const getProPrices = async () => ({
  currencies: {},
});

export async function getPaymentMethods(_userId: string) {
  return [];
}
