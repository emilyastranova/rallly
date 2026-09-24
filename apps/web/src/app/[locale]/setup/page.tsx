import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SetupForm } from "@/app/[locale]/setup/components/setup-form";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Logo } from "@/features/branding/components/logo";
import {
  ensureUserInDefaultSpace,
  getActiveSpaceForUser,
  getOwnedSpace,
} from "@/features/space/loaders";
import { isSpaceChoiceDisabled } from "@/features/space/utils";
import { SignedInFooter } from "@/features/user/components/signed-in-footer";
import { loadUser } from "@/features/user/loaders";
import { Trans } from "@/i18n/client";
import { getTranslation } from "@/i18n/server";
import { getDeviceDateTimeConfig } from "@/lib/datetime/server";
import { validateRedirectUrl } from "@/lib/utils/redirect";

export default async function SetupPage(props: {
  searchParams?: Promise<{ redirectTo?: string }>;
}) {
  const user = await loadUser();
  const searchParams = await props.searchParams;

  await ensureUserInDefaultSpace(user.id);

  const space =
    (await getActiveSpaceForUser(user.id)) ?? (await getOwnedSpace(user.id));

  if (user.name && space) {
    redirect(validateRedirectUrl(searchParams?.redirectTo) ?? "/");
  }

  // Prefill from the device: the timeZone cookie tracks the browser's zone
  // on every visit, and the format cookie holds a per-device choice.
  const device = await getDeviceDateTimeConfig();
  const disableSpaceChoice = isSpaceChoiceDisabled();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-3">
        <Logo size="sm" />
        <ThemeSwitcher />
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className="flex flex-1 overflow-y-auto p-4"
      >
        <article className="m-auto w-full max-w-sm space-y-8">
          <header>
            <h1 className="font-bold text-2xl">
              <Trans
                i18nKey="setupAccountTitle"
                defaults="Set up your account"
              />
            </h1>
            <p className="mt-1 text-muted-foreground">
              <Trans
                i18nKey="setupAccountDescription"
                defaults="Tell us a bit about yourself."
              />
            </p>
          </header>
          <div>
            <SetupForm
              defaultName={user.name}
              defaultTimeZone={user.timeZone ?? device.timeZone}
              defaultTimeFormat={user.timeFormat ?? device.timeFormat}
              email={user.email}
              disableSpaceChoice={disableSpaceChoice}
            />
          </div>
        </article>
      </main>
      <footer className="flex justify-center p-16">
        <SignedInFooter email={user.email} />
      </footer>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation();
  return {
    title: t("setupAccountTitle", {
      defaultValue: "Set up your account",
    }),
  };
}
