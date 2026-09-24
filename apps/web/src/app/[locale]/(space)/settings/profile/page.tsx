import { FieldGroup } from "@rallly/ui/field";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { Params } from "@/app/[locale]/types";
import {
  PageSection,
  PageSectionContent,
  PageSectionDescription,
  PageSectionGroup,
  PageSectionHeader,
  PageSectionTitle,
} from "@/components/page-layout";
import {
  SettingsPage,
  SettingsPageContent,
  SettingsPageDescription,
  SettingsPageHeader,
  SettingsPageTitle,
} from "@/components/settings-layout";
import { loadGroups, loadUserGroups } from "@/features/groups/loaders";
import { loadActiveSpace } from "@/features/space/loaders";
import { loadOptionalUser } from "@/features/user/loaders";
import { Trans } from "@/i18n/client";
import { getTranslation } from "@/i18n/server";
import { getPathname } from "@/lib/pathname";
import { buildSafeRedirectUrl } from "@/lib/utils/redirect";
import {
  AccountDeletionSummary,
  AccountDeletionSummarySkeleton,
} from "./components/account-deletion-summary";
import {
  DeleteAccountSetting,
  PendingDeletionSetting,
} from "./components/delete-account-setting";
import { EmailAddressSetting } from "./components/email-address-setting";
import { ProfileSettings } from "./components/profile-settings";
import { UserGroupSettings } from "./components/user-group-settings";

export default async function Page() {
  // Read from the database — the pending deletion notice depends on
  // deletedAt, which the session snapshot doesn't carry.
  const user = await loadOptionalUser();

  if (!user) {
    redirect(
      buildSafeRedirectUrl({
        destination: "/login",
        returnUrl: await getPathname(),
      }),
    );
  }

  const space = await loadActiveSpace().catch(() => null);
  const [groups, userGroups] = await Promise.all([
    loadGroups({ spaceId: space?.id }),
    loadUserGroups({ userId: user.id }),
  ]);

  return (
    <SettingsPage>
      <SettingsPageHeader>
        <SettingsPageTitle>
          <Trans i18nKey="profile" defaults="Profile" />
        </SettingsPageTitle>
        <SettingsPageDescription>
          <Trans
            i18nKey="profileDescription"
            defaults="Change your profile settings"
          />
        </SettingsPageDescription>
      </SettingsPageHeader>
      <SettingsPageContent>
        <PageSectionGroup>
          <PageSection variant="card">
            <PageSectionContent>
              <ProfileSettings name={user.name} image={user.image} />
            </PageSectionContent>
          </PageSection>

          <PageSection variant="card">
            <PageSectionHeader>
              <PageSectionTitle>
                <Trans i18nKey="profileAccount" defaults="Account" />
              </PageSectionTitle>
              <PageSectionDescription>
                <Trans
                  i18nKey="profileEmailAddressDescription"
                  defaults="Your email address is used to log in to your account"
                />
              </PageSectionDescription>
            </PageSectionHeader>
            <PageSectionContent>
              <FieldGroup variant="divided">
                <EmailAddressSetting email={user.email} />
              </FieldGroup>
            </PageSectionContent>
          </PageSection>

          <UserGroupSettings
            availableGroups={groups}
            initialPrimaryGroupId={userGroups.primaryGroupId}
            initialGroupIds={userGroups.groups.map((g) => g.id)}
          />

          <PageSection variant="card">
            <PageSectionHeader>
              <PageSectionTitle>
                <Trans i18nKey="dangerZone" defaults="Danger zone" />
              </PageSectionTitle>
            </PageSectionHeader>
            <PageSectionContent>
              <FieldGroup variant="divided">
                {user.deletedAt ? (
                  <PendingDeletionSetting deletedAt={user.deletedAt} />
                ) : (
                  <DeleteAccountSetting
                    summary={
                      <Suspense fallback={<AccountDeletionSummarySkeleton />}>
                        <AccountDeletionSummary />
                      </Suspense>
                    }
                  />
                )}
              </FieldGroup>
            </PageSectionContent>
          </PageSection>
        </PageSectionGroup>
      </SettingsPageContent>
    </SettingsPage>
  );
}

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const params = await props.params;
  const { t } = await getTranslation(params.locale);
  return {
    title: t("profile"),
  };
}
