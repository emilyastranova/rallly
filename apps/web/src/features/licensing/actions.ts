"use server";

import { validateLicenseKeyInputSchema } from "@/features/licensing/schema";
import { adminActionClient } from "@/lib/safe-action/server";

export const removeInstanceLicenseAction = adminActionClient
  .metadata({
    actionName: "remove_instance_license",
  })
  .action(async () => {
    return {
      success: true,
      message: "License is managed freely",
    };
  });

export const refreshInstanceLicenseAction = adminActionClient
  .metadata({
    actionName: "refresh_instance_license",
  })
  .action(async () => {
    return {
      success: true,
      message: "License refreshed successfully",
    };
  });

export const validateLicenseKeyAction = adminActionClient
  .metadata({
    actionName: "validate_license_key",
  })
  .inputSchema(validateLicenseKeyInputSchema)
  .action(async () => {
    return {
      valid: true,
    };
  });
