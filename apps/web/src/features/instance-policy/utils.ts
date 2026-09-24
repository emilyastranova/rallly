import type { InstancePolicy } from "./types";

/**
 * The derivation of instance policy from deployment facts.
 */
export function deriveInstancePolicy({
  isSelfHosted,
  whiteLabelAddon,
}: {
  isSelfHosted: boolean;
  whiteLabelAddon: boolean;
}): InstancePolicy {
  return {
    spacesAlwaysShared: isSelfHosted,
    spaceBrandingAllowed: !whiteLabelAddon,
    spaceAttributionConfigurable: !isSelfHosted,
  };
}
