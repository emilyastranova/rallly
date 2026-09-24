import {
  SettingsPage,
  SettingsPageContent,
  SettingsPageDescription,
  SettingsPageHeader,
  SettingsPageTitle,
} from "@/components/settings-layout";
import { loadGroups } from "@/features/groups/loaders";
import { loadActiveSpace } from "@/features/space/loaders";
import { GroupsView } from "./components/groups-view";

export default async function GroupsSettingsPage() {
  const space = await loadActiveSpace();
  const groups = await loadGroups({ spaceId: space.id });

  return (
    <SettingsPage>
      <SettingsPageHeader>
        <SettingsPageTitle>Groups & Subteams</SettingsPageTitle>
        <SettingsPageDescription>
          Organize your students or members into subteams (e.g. Mechanical,
          Software, Electrical, Drive Team).
        </SettingsPageDescription>
      </SettingsPageHeader>
      <SettingsPageContent>
        <GroupsView initialGroups={groups} spaceId={space.id} />
      </SettingsPageContent>
    </SettingsPage>
  );
}
