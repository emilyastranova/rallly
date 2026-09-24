"use client";
import { Button } from "@rallly/ui/button";
import type React from "react";
import { Trans } from "@/i18n/client";

export const UpgradeButton = ({
  children,
  className,
}: React.PropsWithChildren<{
  annual?: boolean;
  currency?: string;
  className?: string;
  onClick?: () => void;
}>) => {
  return (
    <Button type="button" size="xl" className={className} variant="primary">
      {children || <Trans i18nKey="upgradeToPro" defaults="Upgrade to Pro" />}
    </Button>
  );
};
