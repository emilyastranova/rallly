import { cn } from "@rallly/ui";
import { Badge } from "@rallly/ui/badge";
import { Button } from "@rallly/ui/button";
import { Card } from "@rallly/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@rallly/ui/select";
import { MoreHorizontalIcon, PlusIcon, UsersIcon } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import * as React from "react";
import smoothscroll from "smoothscroll-polyfill";

import { TimesShownIn } from "@/components/clock";
import { OptimizedAvatarImage } from "@/components/optimized-avatar-image";
import { usePermissions } from "@/features/poll/client";
import {
  Participant,
  ParticipantName,
} from "@/features/poll/components/participant";
import { ParticipantDropdown } from "@/features/poll/components/participant-dropdown";
import { ParticipantNote } from "@/features/poll/components/participant-note";
import { useOptions, usePoll } from "@/features/poll/components/poll-context";
import { useVisibleParticipants } from "@/features/poll/components/visibility";
import { VotingFooter } from "@/features/poll/components/voting-footer";
import { useVotingForm } from "@/features/poll/components/voting-form";
import { YouAvatar } from "@/features/poll/components/you-avatar";
import { useUser } from "@/features/user/client";
import { Trans, useTranslation } from "@/i18n/client";
import GroupedOptions from "./mobile-poll/grouped-options";

if (typeof window !== "undefined") {
  smoothscroll.polyfill();
}

const MobilePoll: React.FunctionComponent = () => {
  const pollContext = usePoll();

  const { poll } = pollContext;

  const { options } = useOptions();

  const session = useUser();

  const votingForm = useVotingForm();

  const selectedParticipantId = votingForm.watch("participantId");

  const visibleParticipants = useVisibleParticipants();
  const selectedParticipant = selectedParticipantId
    ? visibleParticipants.find(
        (participant) => participant.id === selectedParticipantId,
      )
    : undefined;

  const { canEditParticipant, canAddNewParticipant } = usePermissions();

  const [selectedGroupId, setSelectedGroupId] = React.useState<string>("all");

  const availableGroups = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    for (const p of visibleParticipants) {
      if (p.group) {
        map.set(p.group.name.trim().toLowerCase(), {
          id: p.group.id,
          name: p.group.name,
        });
      }
      if (p.userGroups) {
        for (const ug of p.userGroups) {
          map.set(ug.name.trim().toLowerCase(), {
            id: ug.id,
            name: ug.name,
          });
        }
      }
    }
    return Array.from(map.values());
  }, [visibleParticipants]);

  const filteredParticipants = React.useMemo(() => {
    if (selectedGroupId === "all") {
      return visibleParticipants;
    }
    if (selectedGroupId === "none") {
      return visibleParticipants.filter(
        (p) => !p.group && (!p.userGroups || p.userGroups.length === 0),
      );
    }
    return visibleParticipants.filter((p) => {
      if (p.group?.id === selectedGroupId) return true;
      if (p.userGroups?.some((ug) => ug.id === selectedGroupId)) return true;
      return false;
    });
  }, [visibleParticipants, selectedGroupId]);

  const participantSections = React.useMemo(() => {
    const sections: Array<{
      groupKey: string;
      groupName: string;
      participants: typeof visibleParticipants;
    }> = [];

    const groupMap = new Map<string, typeof visibleParticipants>();
    const ungrouped: typeof visibleParticipants = [];

    for (const p of filteredParticipants) {
      const gName = p.group?.name;
      if (gName) {
        if (!groupMap.has(gName)) {
          groupMap.set(gName, []);
        }
        groupMap.get(gName)?.push(p);
      } else {
        ungrouped.push(p);
      }
    }

    for (const [name, pList] of groupMap.entries()) {
      sections.push({
        groupKey: name,
        groupName: name,
        participants: pList,
      });
    }

    if (ungrouped.length > 0) {
      sections.push({
        groupKey: "ungrouped",
        groupName: sections.length > 0 ? "General / Other" : "Participants",
        participants: ungrouped,
      });
    }

    return sections;
  }, [filteredParticipants]);

  const isEditing = votingForm.watch("mode") !== "view";

  // True while the sticky footer is pinned to the viewport (floating over
  // the option list) rather than resting at the card's end. Tracked via a
  // sentinel after the footer: while the card's end is off-screen, the
  // footer is stuck.
  const footerSentinelRef = React.useRef<HTMLDivElement>(null);
  const [isFooterFloating, setIsFooterFloating] = React.useState(true);

  React.useEffect(() => {
    const sentinel = footerSentinelRef.current;
    if (!sentinel) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      setIsFooterFloating(!entry.isIntersecting);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const { t } = useTranslation();

  return (
    <Card className="overflow-visible">
      <div className="flex flex-col space-y-2 border-b p-2">
        {availableGroups.length > 0 && !isEditing ? (
          <div className="flex items-center gap-1.5 pb-1">
            <Select
              value={selectedGroupId}
              onValueChange={(val) => {
                const nextGroup = val ?? "all";
                setSelectedGroupId(nextGroup);
                if (selectedParticipantId && selectedParticipantId !== "all") {
                  const p = visibleParticipants.find(
                    (p) => p.id === selectedParticipantId,
                  );
                  if (
                    p &&
                    nextGroup !== "all" &&
                    p.group?.id !== nextGroup &&
                    !p.userGroups?.some((ug) => ug.id === nextGroup)
                  ) {
                    votingForm.setValue("participantId", "all");
                  }
                }
              }}
            >
              <SelectTrigger className="h-8 w-full gap-1.5 border-border bg-muted/30 px-2.5 font-medium text-xs">
                <UsersIcon className="size-3.5 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="All Groups">
                  {(selected: string | null | undefined) => {
                    if (!selected || selected === "all")
                      return "All Groups / Teams";
                    if (selected === "none") return "Ungrouped";
                    return (
                      availableGroups.find((g) => g.id === selected)?.name ??
                      selected
                    );
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups / Teams</SelectItem>
                {availableGroups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
                <SelectItem value="none">Ungrouped</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}
        <div className="flex gap-x-2">
          {selectedParticipantId || !isEditing ? (
            <Select
              value={selectedParticipantId ?? "all"}
              onValueChange={(participantId) => {
                if (participantId) {
                  votingForm.setValue("participantId", participantId);
                }
              }}
              disabled={isEditing}
            >
              <SelectTrigger
                className="flex-1"
                data-testid="participant-selector"
              >
                <SelectValue>
                  {(val: string | null | undefined) => {
                    if (!val || val === "all") {
                      return (
                        <div className="flex items-center gap-x-2">
                          <UsersIcon className="size-4 shrink-0 text-muted-foreground" />
                          <span>
                            {selectedGroupId === "all"
                              ? t("allParticipants", {
                                  defaultValue: "All participants",
                                })
                              : `${availableGroups.find((g) => g.id === selectedGroupId)?.name ?? "Group"} (${filteredParticipants.length})`}
                          </span>
                        </div>
                      );
                    }
                    const p = visibleParticipants.find((p) => p.id === val);
                    if (!p) return val;
                    return (
                      <div className="flex items-center gap-x-2 truncate">
                        <OptimizedAvatarImage
                          name={p.name}
                          src={p.image ?? undefined}
                          size="sm"
                        />
                        <span className="truncate">{p.name}</span>
                        {p.group?.name ? (
                          <Badge
                            variant="outline"
                            className="shrink-0 px-1 py-0 font-normal text-[10px]"
                          >
                            {p.group.name}
                          </Badge>
                        ) : null}
                      </div>
                    );
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-x-2.5">
                    <UsersIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span>
                      {selectedGroupId === "all"
                        ? t("allParticipants", {
                            defaultValue: "All participants",
                          })
                        : `All ${availableGroups.find((g) => g.id === selectedGroupId)?.name ?? ""} (${filteredParticipants.length})`}
                    </span>
                  </div>
                </SelectItem>
                <SelectSeparator />
                {participantSections.map((section) => (
                  <SelectGroup key={section.groupKey}>
                    {participantSections.length > 1 ||
                    section.groupKey !== "ungrouped" ? (
                      <SelectLabel className="flex items-center gap-1.5 px-2 py-1 font-semibold text-primary text-xs">
                        <UsersIcon className="size-3" />
                        <span>{section.groupName}</span>
                        <span className="font-normal text-muted-foreground">
                          ({section.participants.length})
                        </span>
                      </SelectLabel>
                    ) : null}
                    {section.participants.map((participant) => (
                      <SelectItem key={participant.id} value={participant.id}>
                        <div className="flex items-center gap-2">
                          <OptimizedAvatarImage
                            name={participant.name}
                            src={participant.image ?? undefined}
                            size="sm"
                          />
                          <ParticipantName>{participant.name}</ParticipantName>
                          {participant.group?.name ? (
                            <Badge
                              variant="outline"
                              className="px-1 py-0 font-normal text-[10px]"
                            >
                              {participant.group.name}
                            </Badge>
                          ) : null}
                          {session.ownsObject(participant) && (
                            <Badge>
                              <Trans i18nKey="you" defaults="You" />
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex h-9 grow items-center px-1">
              <Participant>
                <YouAvatar />
                <ParticipantName>
                  {t("you", { defaultValue: "You" })}
                </ParticipantName>
              </Participant>
            </div>
          )}
          {isEditing ? (
            <Button
              onClick={() => {
                if (votingForm.watch("mode") === "new") {
                  votingForm.cancel();
                } else {
                  votingForm.setValue("mode", "view");
                }
              }}
            >
              {t("cancel")}
            </Button>
          ) : selectedParticipant ? (
            <>
              {selectedParticipant.note ? (
                <ParticipantNote
                  note={selectedParticipant.note}
                  participantName={selectedParticipant.name}
                  createdAt={selectedParticipant.createdAt}
                  size="icon"
                />
              ) : null}
              <ParticipantDropdown
                align="end"
                disabled={!canEditParticipant(selectedParticipant.id)}
                participant={{
                  name: selectedParticipant.name,
                  userId: selectedParticipant.userId ?? undefined,
                  email: selectedParticipant.email ?? undefined,
                  editUrl: selectedParticipant.editUrl,
                  id: selectedParticipant.id,
                }}
                onEdit={() => {
                  votingForm.setEditingParticipantId(selectedParticipant.id);
                }}
                onDelete={() => {
                  votingForm.setValue("participantId", "all");
                }}
              >
                <Button
                  aria-label={t("moreOptions", {
                    defaultValue: "More options",
                  })}
                  variant="ghost"
                  size="icon"
                >
                  <MoreHorizontalIcon />
                </Button>
              </ParticipantDropdown>
            </>
          ) : canAddNewParticipant ? (
            <Button
              aria-label={t("addParticipant", {
                defaultValue: "Add participant",
              })}
              size="icon"
              onClick={() => {
                votingForm.newParticipant();
              }}
            >
              <PlusIcon />
            </Button>
          ) : null}
        </div>
      </div>
      {poll.options[0]?.duration !== 0 && poll.timeZone ? (
        <div className="border-b p-2">
          <TimesShownIn />
        </div>
      ) : null}
      <GroupedOptions
        selectedParticipantId={selectedParticipantId}
        options={options}
        editable={isEditing}
        group={(option) => {
          if (option.type === "timeSlot") {
            return `${option.dow} ${option.day} ${option.month} ${option.year}`;
          }
          return `${option.month} ${option.year}`;
        }}
      />
      <AnimatePresence>
        {isEditing ? (
          <m.div
            className="sticky bottom-0 z-20"
            variants={{
              hidden: { opacity: 0, y: -20, height: 0 },
              visible: { opacity: 1, y: 0, height: "auto" },
            }}
            initial="hidden"
            animate="visible"
            exit={{
              opacity: 0,
              y: -10,
              height: 0,
              transition: { duration: 0.2 },
            }}
          >
            {/* While floating, 3px + the page's p-3 and the card's 1px
                border puts the footer's edges at 16px from the viewport,
                flush with the floating comments button (right-4). At rest
                it returns to the card's normal inset. */}
            <VotingFooter
              className={cn(
                "pb-3 transition-[padding] duration-200 ease-out",
                isFooterFloating ? "px-[3px]" : "px-3",
              )}
            />
          </m.div>
        ) : null}
      </AnimatePresence>
      <div ref={footerSentinelRef} aria-hidden="true" />
    </Card>
  );
};

export default MobilePoll;
