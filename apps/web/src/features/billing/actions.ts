"use server";

import { authActionClient } from "@/lib/safe-action/server";

export const upgradeToProAction = authActionClient
  .metadata({ actionName: "upgrade_to_pro" })
  .action(async () => {
    return { success: true };
  });

export const openBillingDetailsAction = authActionClient
  .metadata({ actionName: "open_billing_details" })
  .action(async () => {
    return { success: true };
  });

export const switchToYearlyAction = authActionClient
  .metadata({ actionName: "switch_to_yearly" })
  .action(async () => {
    return { success: true };
  });
