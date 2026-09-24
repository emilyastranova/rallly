import {
  SettingsPage,
  SettingsPageContent,
  SettingsPageDescription,
  SettingsPageHeader,
  SettingsPageTitle,
} from "@/components/settings-layout";
import {
  loadGroups,
  loadSpaceMembersWithGroups,
} from "@/features/groups/loaders";
import { loadActiveSpace } from "@/features/space/loaders";
import { GroupsView } from "./components/groups-view";
import { MemberGroupAssignments } from "./components/member-group-assignments";

export default async function GroupsSettingsPage() {
  const space = await loadActiveSpace();
  const [groups, members] = await Promise.all([
    loadGroups({ spaceId: space.id }),
    loadSpaceMembersWithGroups({ spaceId: space.id }),
  ]);

  return (
    <SettingsPage>
      <SettingsPageHeader>
        <SettingsPageTitle>Groups & Subteams</SettingsPageTitle>
        <SettingsPageDescription>
          Organize your students or members into subteams (e.g. Mechanical,
          Software, Electrical, Drive Team) and manage assignments.
        </SettingsPageDescription>
      </SettingsPageHeader>
      <SettingsPageContent>
        <GroupsView initialGroups={groups} spaceId={space.id} />
        <MemberGroupAssignments
          members={members}
          groups={groups}
          spaceId={space.id}
          isAdmin={space.role === "admin"}
        />
      </SettingsPageContent>
    </SettingsPage>
  );
}
