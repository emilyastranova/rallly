import type { PureAbility } from "@casl/ability";
import { AbilityBuilder } from "@casl/ability";
import type { PrismaQuery } from "@casl/prisma";
import { createPrismaAbility } from "@casl/prisma";
import type { SpaceTier } from "./schema";

type Action = "invite" | "schedule" | "duplicate" | "update";
type Subject = "Member" | "Poll" | "AdvancedPollSettings";

export type SpaceAbilityContext = {
  tier?: SpaceTier;
};
export type SpaceAbility = PureAbility<[Action, Subject], PrismaQuery>;

export function defineAbilityForSpace(_context?: SpaceAbilityContext) {
  const { can, build } = new AbilityBuilder<SpaceAbility>(createPrismaAbility);

  // In this libre edition, all spaces have full Pro capabilities:
  can("invite", "Member");
  can(["schedule", "duplicate"], "Poll");
  can("update", "AdvancedPollSettings");

  return build();
}
