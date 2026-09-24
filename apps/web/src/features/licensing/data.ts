import "server-only";

import { cache } from "react";

export const loadInstanceLicense = cache(async () => {
  return {
    licenseKey: "LIBRE-OPEN-SOURCE",
    licenseeName: "Community",
    licenseeEmail: "libre@localhost",
    issuedAt: new Date("2026-01-01"),
    expiresAt: null,
    seats: Number.POSITIVE_INFINITY,
    type: "ENTERPRISE" as const,
    whiteLabelAddon: false,
  };
});

export function getInstanceLicense() {
  return loadInstanceLicense();
}

export const cached_getInstanceLicense = async () => loadInstanceLicense();

export const getUserLimit = async () => {
  return Number.POSITIVE_INFINITY;
};

export const getWhiteLabelAddon = async () => {
  return false;
};
