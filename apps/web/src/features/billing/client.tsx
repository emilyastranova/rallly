"use client";

import React from "react";
import { create } from "zustand";
import type { SpaceTier } from "@/features/space/schema";

export const CURRENCY_COOKIE_NAME = "currency";

const TierContext = React.createContext<SpaceTier>("pro");

export function TierProvider({
  children,
}: {
  tier?: SpaceTier;
  children: React.ReactNode;
}) {
  return <TierContext.Provider value="pro">{children}</TierContext.Provider>;
}

export function useTier(): SpaceTier {
  return "pro";
}

export function useIsFree() {
  return false;
}

export type PayWallTrigger = {
  from:
    | "poll-settings"
    | "manage-poll"
    | "custom-branding"
    | "api-keys"
    | "webhooks"
    | "space-members"
    | "space-collaboration"
    | "billing-settings"
    | "sidebar"
    | "invite-dialog"
    | "poll-footer";
  setting?: string;
  action?: string;
  pollId?: string;
};

type PayWallStore = {
  isOpen: boolean;
  trigger: PayWallTrigger | null;
  show: (trigger: PayWallTrigger) => void;
  hide: () => void;
};

export const usePayWallStore = create<PayWallStore>(() => ({
  isOpen: false,
  trigger: null,
  show: () => {},
  hide: () => {},
}));

export const showPayWall = (_trigger: PayWallTrigger) => {};

export type PayWallPricing = null;

export function setCurrencyCookie(_currency: string) {}
