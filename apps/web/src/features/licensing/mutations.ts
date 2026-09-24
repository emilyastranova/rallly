import "server-only";

export class LicenseManager {
  async validateLicenseKey(_params: unknown) {
    return {
      data: {
        licenseeName: "Community",
        licenseeEmail: "libre@localhost",
        issuedAt: new Date("2026-01-01"),
        expiresAt: null,
        seats: Number.POSITIVE_INFINITY,
        type: "ENTERPRISE" as const,
        whiteLabelAddon: true,
      },
    };
  }
}

export const licenseManager = new LicenseManager();

export async function setInstanceLicense(_data: unknown) {}
export async function createLicenseCheckoutSession(_params: unknown) {
  return "";
}
