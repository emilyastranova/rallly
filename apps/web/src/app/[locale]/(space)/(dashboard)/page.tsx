import type { Metadata } from "next";
import { loadPinnedPolls, loadPollStatusCounts } from "@/features/poll/loaders";
import {
  loadActiveSpace,
  loadUpcomingEventCount,
} from "@/features/space/loaders";
import { defineAbilityForMember } from "@/features/space/member/ability";
import { loadUser, loadUserHasNoAccounts } from "@/features/user/loaders";
import { getTranslation } from "@/i18n/server";
import { DashboardHome } from "./dashboard-home";

export default async function Page() {
  const space = await loadActiveSpace();
  const [
    user,
    pollStatusCounts,
    upcomingEventCount,
    hasNoAccounts,
    pinnedPolls,
  ] = await Promise.all([
    loadUser(),
    loadPollStatusCounts(),
    loadUpcomingEventCount(),
    loadUserHasNoAccounts(),
    loadPinnedPolls({ spaceId: space.id }),
  ]);

  const ability = defineAbilityForMember({ user: { id: user.id }, space });

  return (
    <DashboardHome
      openPollCount={pollStatusCounts.open}
      upcomingEventCount={upcomingEventCount}
      memberCount={space.memberCount}
      seatCount={space.seatCount}
      hasNoAccounts={hasNoAccounts}
      canManageBilling={ability.can("manage", "Billing")}
      canManageMembers={space.role === "admin"}
      pinnedPolls={pinnedPolls}
    />
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation();
  return {
    title: t("home", {
      defaultValue: "Home",
    }),
  };
}
