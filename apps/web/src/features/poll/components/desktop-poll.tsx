"use client";

import { cn } from "@rallly/ui";
import { Badge } from "@rallly/ui/badge";
import { Button } from "@rallly/ui/button";
import { Card, CardHeader, CardTitle } from "@rallly/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rallly/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@rallly/ui/tooltip";
import {
  ArrowLeftIcon,
  ArrowLeftRightIcon,
  ArrowRightIcon,
  ExpandIcon,
  PlusIcon,
  ShrinkIcon,
  Users2Icon,
} from "lucide-react";
import * as React from "react";
import { Controller } from "react-hook-form";
import { useMeasure, useScroll } from "react-use";
import useClickAway from "react-use/lib/useClickAway";

import { TimesShownIn } from "@/components/clock";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@/components/empty-state";
import { OptimizedAvatarImage } from "@/components/optimized-avatar-image";
import { ScrollContainer } from "@/components/scroll-container";
import {
  useParticipants,
  usePermissions,
  usePoll,
} from "@/features/poll/client";
import { useOptions } from "@/features/poll/components/poll-context";
import { ConnectedScoreSummary } from "@/features/poll/components/score-summary";
import { useVisibleParticipants } from "@/features/poll/components/visibility";
import VoteIcon from "@/features/poll/components/vote-icon";
import { VoteSelector } from "@/features/poll/components/vote-selector";
import { VotingFooter } from "@/features/poll/components/voting-footer";
import { useVotingForm } from "@/features/poll/components/voting-form";
import { YouAvatar } from "@/features/poll/components/you-avatar";
import { useUser } from "@/features/user/client";
import { Trans, useTranslation } from "@/i18n/client";
import ParticipantRow from "./desktop-poll/participant-row";
import ParticipantRowForm from "./desktop-poll/participant-row-form";
import PollHeader from "./desktop-poll/poll-header";

function EscapeListener({ onEscape }: { onEscape: () => void }) {
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onEscape();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onEscape]);

  return null;
}

function TableControls({
  optionCount,
  showTimeZone,
  showScrollControls,
  canScrollPrev,
  canScrollNext,
  showScrollIndicator,
  expanded,
  onExpand,
  onCollapse,
  onGoToPreviousPage,
  onGoToNextPage,
}: {
  optionCount: number;
  showTimeZone: boolean;
  showScrollControls: boolean;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  showScrollIndicator: boolean;
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  onGoToPreviousPage: () => void;
  onGoToNextPage: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-4">
      {showTimeZone ? (
        <>
          <TimesShownIn />
          <span className="h-4 w-px bg-border" />
        </>
      ) : null}
      <div className="text-muted-foreground text-sm">
        <Trans
          i18nKey="optionCount"
          defaults="{count, plural, one {# option} other {# options}}"
          values={{ count: optionCount }}
        />
      </div>
      <div className="flex gap-x-1">
        {showScrollControls ? (
          <>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    aria-label={t("scrollLeft", {
                      defaultValue: "Scroll left",
                    })}
                    variant="ghost"
                    size="icon"
                    disabled={!canScrollPrev}
                    onClick={onGoToPreviousPage}
                  >
                    <ArrowLeftIcon className="text-muted-foreground" />
                  </Button>
                }
              />
              <TooltipContent>
                <Trans i18nKey="scrollLeft" defaults="Scroll left" />
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    aria-label={t("scrollRight", {
                      defaultValue: "Scroll right",
                    })}
                    className="relative"
                    variant="ghost"
                    size="icon"
                    disabled={!canScrollNext}
                    onClick={onGoToNextPage}
                  >
                    <ArrowRightIcon className="text-muted-foreground" />
                    {showScrollIndicator ? (
                      <span className="absolute -top-0.5 -right-0.5 flex size-2">
                        <span className="absolute top-0 right-0 inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-rose-500" />
                      </span>
                    ) : null}
                  </Button>
                }
              />
              <TooltipContent>
                <Trans i18nKey="scrollRight" defaults="Scroll right" />
              </TooltipContent>
            </Tooltip>
          </>
        ) : null}
        {expanded ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label={t("shrink", { defaultValue: "Shrink" })}
                  variant="ghost"
                  size="icon"
                  onClick={onCollapse}
                >
                  <ShrinkIcon className="text-muted-foreground" />
                </Button>
              }
            />
            <TooltipContent>
              <Trans i18nKey="shrink" defaults="Shrink" />
            </TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger
              delay={0}
              render={
                <Button
                  aria-label={t("expand", { defaultValue: "Expand" })}
                  variant="ghost"
                  size="icon"
                  onClick={onExpand}
                >
                  <ExpandIcon className="text-muted-foreground" />
                </Button>
              }
            />
            <TooltipContent>
              <Trans i18nKey="expand" defaults="Expand" />
            </TooltipContent>
          </Tooltip>
        )}
        {expanded ? <EscapeListener onEscape={onCollapse} /> : null}
      </div>
    </div>
  );
}

const DesktopPoll: React.FunctionComponent = () => {
  const poll = usePoll();

  const [measureRef, { height }] = useMeasure<HTMLDivElement>();

  const [didScroll, setDidScroll] = React.useState(false);

  const { canAddNewParticipant } = usePermissions();
  const [expanded, setExpanded] = React.useState(false);

  const expand = React.useCallback(() => {
    document.body.style.overflow = "hidden";
    setExpanded(true);
  }, []);

  const collapse = React.useCallback(() => {
    // enable scrolling on body
    document.body.style.overflow = "";
    setExpanded(false);
  }, []);

  const { t } = useTranslation();
  const votingForm = useVotingForm();
  const mode = votingForm.watch("mode");

  const { options } = useOptions();
  const user = useUser();
  const [isAxesSwapped, setIsAxesSwapped] = React.useState<boolean>(true);

  const { participants } = useParticipants();
  const visibleParticipants = useVisibleParticipants();

  const [selectedGroupId, setSelectedGroupId] = React.useState<string>("all");

  const availableGroups = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    for (const p of participants) {
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
  }, [participants]);

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

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const [isOverflowing, setIsOverflowing] = React.useState(false);

  const { x } = useScroll(scrollRef as React.RefObject<HTMLElement>);

  const containerRef = React.useRef<HTMLDivElement>(null);

  useClickAway(containerRef, () => {
    collapse();
  });

  const scrollIncrement = isAxesSwapped ? 240 : 340;

  const goToNextPage = React.useCallback(() => {
    setDidScroll(true);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollLeft + scrollIncrement,
        behavior: "smooth",
      });
    }
  }, [scrollIncrement]);

  const goToPreviousPage = React.useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollLeft - scrollIncrement,
        behavior: "smooth",
      });
    }
  }, [scrollIncrement]);

  return (
    <Card>
      <div ref={measureRef} style={{ height: expanded ? height : undefined }}>
        <div
          className={cn(
            expanded
              ? "fixed top-0 left-0 z-50 flex h-full w-full items-center justify-center p-8"
              : "",
          )}
        >
          <div
            className={cn(
              "flex max-h-full flex-col overflow-hidden rounded-2xl",
              {
                "w-full max-w-7xl border border-popover-border bg-card shadow-2xl":
                  expanded,
              },
            )}
            ref={containerRef}
          >
            <CardHeader className="flex items-center justify-between gap-4 border-b">
              <div className="flex items-center gap-x-2.5">
                <CardTitle>
                  <Trans i18nKey="participants" />
                </CardTitle>
                <Badge>{filteredParticipants.length}</Badge>
                {canAddNewParticipant && mode !== "new" ? (
                  <Button
                    aria-label={t("addParticipant", {
                      defaultValue: "Add participant",
                    })}
                    className="ml-1"
                    size="icon-xs"
                    data-testid="add-participant-button"
                    onClick={() => {
                      votingForm.newParticipant();
                    }}
                  >
                    <PlusIcon className="text-muted-foreground" />
                  </Button>
                ) : null}
                {availableGroups.length > 0 ? (
                  <div className="ml-2 flex items-center">
                    <Select
                      value={selectedGroupId}
                      onValueChange={(val) => setSelectedGroupId(val ?? "all")}
                    >
                      <SelectTrigger className="h-7 gap-1.5 border-border bg-card px-2.5 text-xs">
                        <Users2Icon className="size-3.5 text-muted-foreground" />
                        <SelectValue placeholder="All Groups">
                          {(selected: string | null | undefined) => {
                            if (!selected || selected === "all")
                              return "All Groups";
                            if (selected === "none") return "Ungrouped";
                            return (
                              availableGroups.find((g) => g.id === selected)
                                ?.name ?? selected
                            );
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Groups</SelectItem>
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
                <Button
                  type="button"
                  variant={isAxesSwapped ? "default" : "default"}
                  size="xs"
                  onClick={() => setIsAxesSwapped(!isAxesSwapped)}
                  className={cn(
                    "ml-2 h-7 gap-1.5 px-2 font-medium text-xs",
                    isAxesSwapped
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "",
                  )}
                  title="Switch the X and Y axes of the schedule"
                >
                  <ArrowLeftRightIcon className="size-3.5" />
                  <span>{isAxesSwapped ? "Dates on Top" : "Names on Top"}</span>
                </Button>
              </div>
              <TableControls
                optionCount={
                  isAxesSwapped
                    ? filteredParticipants.length
                    : poll.options.length
                }
                showTimeZone={poll.options[0]?.duration !== 0 && !poll.timeZone}
                showScrollControls={isOverflowing}
                canScrollPrev={x > 0}
                canScrollNext={
                  !scrollRef.current ||
                  x + scrollRef.current.offsetWidth <
                    scrollRef.current.scrollWidth
                }
                showScrollIndicator={!didScroll}
                expanded={expanded}
                onExpand={expand}
                onCollapse={collapse}
                onGoToPreviousPage={goToPreviousPage}
                onGoToNextPage={goToNextPage}
              />
            </CardHeader>
            <div className="flex min-h-0 flex-1 flex-col">
              {participants.length > 0 || mode !== "view" ? (
                <div className="relative flex min-h-0 flex-1 flex-col">
                  <div
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute top-0 bottom-3 z-30 w-4 border-l bg-linear-to-r from-gray-800/5 via-transparent to-transparent transition-opacity",
                      isAxesSwapped ? "left-[280px]" : "left-[340px]",
                      x > 0 ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <ScrollContainer
                    onScroll={() => {
                      if (!didScroll) {
                        setDidScroll(true);
                      }
                    }}
                    onOverflowChange={(isOverflowing) => {
                      setIsOverflowing(isOverflowing);
                    }}
                    ref={scrollRef}
                    className={cn(
                      "scrollbar-thin dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500 scrollbar-thumb-gray-300 scrollbar-track-gray-100 relative z-10 h-full min-h-0 grow overflow-auto overscroll-x-none",
                    )}
                  >
                    {isAxesSwapped ? (
                      <table className="w-full table-auto border-separate border-spacing-0">
                        <thead>
                          <tr>
                            <th
                              style={{
                                minWidth: 280,
                                maxWidth: 280,
                                width: 280,
                              }}
                              className="sticky top-0 left-0 z-30 h-44 border-border border-b bg-card px-3 py-2 text-left align-bottom"
                            >
                              <div className="flex flex-col gap-1 pb-1">
                                <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                                  Dates & Options
                                </span>
                                <span className="font-normal text-[11px] text-muted-foreground">
                                  {filteredParticipants.length}{" "}
                                  {filteredParticipants.length === 1
                                    ? "participant"
                                    : "participants"}
                                </span>
                              </div>
                            </th>
                            {mode !== "view" ? (
                              <th className="sticky top-0 z-20 h-44 min-w-[52px] max-w-[60px] overflow-visible border-primary/50 border-b border-l bg-primary/5 p-0 align-bottom">
                                <div className="relative h-full w-full overflow-visible">
                                  <div className="absolute bottom-3 left-4 flex w-44 origin-bottom-left rotate-[-60deg] items-center gap-1.5 whitespace-nowrap text-left">
                                    <YouAvatar />
                                    <span className="max-w-[120px] truncate font-semibold text-primary text-xs">
                                      {mode === "new"
                                        ? t("you", { defaultValue: "You" })
                                        : (participants.find(
                                            (p) =>
                                              p.id ===
                                              votingForm.watch("participantId"),
                                          )?.name ??
                                          t("you", { defaultValue: "You" }))}
                                    </span>
                                    <Badge
                                      variant="default"
                                      className="shrink-0 px-1 py-0 text-[9px]"
                                    >
                                      Voting
                                    </Badge>
                                  </div>
                                </div>
                              </th>
                            ) : null}
                            {participantSections.map((section) => (
                              <React.Fragment key={section.groupKey}>
                                {participantSections.length > 1 ||
                                section.groupKey !== "ungrouped" ? (
                                  <th
                                    key={`sep-th-${section.groupKey}`}
                                    className="sticky top-0 z-20 h-44 w-9 min-w-9 max-w-9 select-none border-border border-r border-b border-l bg-muted/70 p-1 align-bottom"
                                  >
                                    <div className="flex h-full flex-col items-center justify-end gap-1.5 pb-3">
                                      <Badge
                                        variant="outline"
                                        className="h-4 px-1 py-0 font-semibold text-[9px]"
                                      >
                                        {section.participants.length}
                                      </Badge>
                                      <span className="rotate-180 whitespace-nowrap font-semibold text-foreground/80 text-xs tracking-tight [writing-mode:vertical-rl]">
                                        {section.groupName}
                                      </span>
                                      <Users2Icon className="size-3.5 shrink-0 text-primary" />
                                    </div>
                                  </th>
                                ) : null}
                                {section.participants.map((participant) => {
                                  const isEditingThis =
                                    mode === "edit" &&
                                    votingForm.watch("participantId") ===
                                      participant.id;
                                  if (isEditingThis) return null;

                                  const isYou = user.ownsObject(participant);

                                  return (
                                    <th
                                      key={participant.id}
                                      className="sticky top-0 z-20 h-44 min-w-[52px] max-w-[60px] overflow-visible border-border border-b border-l bg-card p-0 align-bottom"
                                    >
                                      <div className="relative h-full w-full overflow-visible">
                                        <div
                                          className="absolute bottom-3 left-4 flex w-44 origin-bottom-left rotate-[-60deg] items-center gap-1.5 whitespace-nowrap text-left"
                                          title={participant.name}
                                        >
                                          <OptimizedAvatarImage
                                            name={participant.name}
                                            src={participant.image ?? undefined}
                                            size="sm"
                                          />
                                          <span className="max-w-[130px] truncate font-medium text-foreground text-xs">
                                            {participant.name}
                                          </span>
                                          {isYou ? (
                                            <Badge
                                              variant="secondary"
                                              className="shrink-0 px-1 py-0 text-[9px]"
                                            >
                                              <Trans
                                                i18nKey="you"
                                                defaults="You"
                                              />
                                            </Badge>
                                          ) : null}
                                        </div>
                                      </div>
                                    </th>
                                  );
                                })}
                              </React.Fragment>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {options.map((option) => {
                            const voteIndex = poll.options.findIndex(
                              (o) => o.id === option.optionId,
                            );

                            return (
                              <tr key={option.optionId} className="group">
                                <td
                                  style={{
                                    minWidth: 280,
                                    maxWidth: 280,
                                    width: 280,
                                  }}
                                  className="sticky left-0 z-10 border-border border-b bg-card px-3 py-2"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex min-w-0 flex-col">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-foreground text-xs">
                                          {option.dow}, {option.month}{" "}
                                          {option.day}
                                        </span>
                                        {option.year ? (
                                          <span className="text-[10px] text-muted-foreground">
                                            {option.year}
                                          </span>
                                        ) : null}
                                      </div>
                                      {option.title ? (
                                        <span className="truncate font-medium text-primary text-xs">
                                          {option.title}
                                        </span>
                                      ) : null}
                                      <span className="text-[11px] text-muted-foreground">
                                        {option.type === "timeSlot"
                                          ? `${option.startTime} – ${option.endTime}`
                                          : t("allDay", {
                                              defaultValue: "All day",
                                            })}
                                      </span>
                                    </div>
                                    <div className="shrink-0">
                                      <ConnectedScoreSummary
                                        optionId={option.optionId}
                                        filteredParticipants={
                                          filteredParticipants
                                        }
                                      />
                                    </div>
                                  </div>
                                </td>

                                {mode !== "view" ? (
                                  <td className="h-12 border-primary/30 border-b border-l bg-primary/5 text-center">
                                    <div className="flex items-center justify-center p-1">
                                      {voteIndex !== -1 ? (
                                        <Controller
                                          control={votingForm.control}
                                          name={`votes.${voteIndex}.type`}
                                          render={({ field }) => (
                                            <VoteSelector
                                              value={field.value}
                                              onChange={(value) =>
                                                field.onChange(value)
                                              }
                                              allowTentativeVotes={
                                                poll.allowTentativeVotes
                                              }
                                              optionLabel={`${option.day} ${option.month}`}
                                            />
                                          )}
                                        />
                                      ) : null}
                                    </div>
                                  </td>
                                ) : null}

                                {participantSections.map((section) => (
                                  <React.Fragment key={section.groupKey}>
                                    {participantSections.length > 1 ||
                                    section.groupKey !== "ungrouped" ? (
                                      <td
                                        key={`sep-td-${section.groupKey}`}
                                        className="w-9 min-w-9 max-w-9 border-border/70 border-r border-b border-l bg-muted/30"
                                      />
                                    ) : null}
                                    {section.participants.map((participant) => {
                                      const isEditingThis =
                                        mode === "edit" &&
                                        votingForm.watch("participantId") ===
                                          participant.id;
                                      if (isEditingThis) return null;

                                      const vote = participant.votes.find(
                                        (v) => v.optionId === option.optionId,
                                      )?.type;

                                      return (
                                        <td
                                          key={participant.id}
                                          className="h-12 border-border border-b border-l bg-card text-center"
                                        >
                                          <div className="flex items-center justify-center">
                                            <VoteIcon type={vote} />
                                          </div>
                                        </td>
                                      );
                                    })}
                                  </React.Fragment>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <table className="w-full table-auto border-separate border-spacing-0">
                        <thead>
                          <PollHeader
                            filteredParticipants={filteredParticipants}
                          />
                        </thead>
                        <tbody className="relative">
                          {mode === "new" ? (
                            <ParticipantRowForm isNew={true} />
                          ) : null}
                          {participantSections.map((section, sIdx) => (
                            <React.Fragment key={section.groupKey}>
                              {participantSections.length > 1 ||
                              section.groupKey !== "ungrouped" ? (
                                <tr
                                  key={`sep-${section.groupKey}`}
                                  className="border-border border-y bg-muted/40"
                                >
                                  <td
                                    colSpan={1 + poll.options.length}
                                    className="sticky left-0 z-20 bg-muted/70 px-3 py-1.5 font-semibold text-foreground/80 text-xs tracking-tight"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Users2Icon className="size-3.5 text-primary" />
                                      <span>{section.groupName}</span>
                                      <Badge
                                        variant="outline"
                                        className="h-3.5 px-1 py-0 text-[10px]"
                                      >
                                        {section.participants.length}
                                      </Badge>
                                    </div>
                                  </td>
                                </tr>
                              ) : null}
                              {section.participants.map((participant, i) => {
                                const isLastOverall =
                                  sIdx === participantSections.length - 1 &&
                                  i === section.participants.length - 1;
                                return (
                                  <ParticipantRow
                                    key={participant.id}
                                    participant={{
                                      id: participant.id,
                                      name: participant.name,
                                      userId: participant.userId ?? undefined,
                                      email: participant.email ?? undefined,
                                      editUrl: participant.editUrl,
                                      note: participant.note,
                                      createdAt: participant.createdAt,
                                      image: participant.image,
                                      votes: participant.votes,
                                      groupName: participant.group?.name,
                                    }}
                                    editMode={
                                      votingForm.watch("mode") === "edit" &&
                                      votingForm.watch("participantId") ===
                                        participant.id
                                    }
                                    className={isLastOverall ? "last-row" : ""}
                                    onChangeEditMode={(isEditing) => {
                                      if (isEditing) {
                                        votingForm.setEditingParticipantId(
                                          participant.id,
                                        );
                                      }
                                    }}
                                  />
                                );
                              })}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </ScrollContainer>
                </div>
              ) : (
                <EmptyState className="p-16">
                  <EmptyStateIcon>
                    <Users2Icon />
                  </EmptyStateIcon>
                  <EmptyStateTitle>
                    <Trans
                      i18nKey="noParticipants"
                      defaults="No participants"
                    />
                  </EmptyStateTitle>
                  <EmptyStateDescription>
                    <Trans
                      i18nKey="noParticipantsDescription"
                      components={{ b: <strong className="font-semibold" /> }}
                      defaults="Click <b>Share</b> to invite participants"
                    />
                  </EmptyStateDescription>
                </EmptyState>
              )}
              {mode === "new" ? (
                <div className="border-t p-3">
                  <VotingFooter />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DesktopPoll;
