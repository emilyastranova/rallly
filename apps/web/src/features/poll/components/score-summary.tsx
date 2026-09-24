import { cn } from "@rallly/ui";
import { User2Icon } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import * as React from "react";
import { usePrevious } from "react-use";
import { usePoll } from "@/features/poll/components/poll-context";
import { IfScoresVisible } from "@/features/poll/components/visibility";
import type { VoteType } from "@/features/poll/constants";

export interface PopularityScoreProps {
  yesScore: number;
  ifNeedBeScore?: number;
  highlight?: boolean;
  highScore: number;
  /**
   * When false the amber tentative marker is dropped. Tentative votes cast
   * before the poll turned the option off still count toward the total.
   */
  showTentative?: boolean;
}

export const ConnectedScoreSummary: React.FunctionComponent<{
  optionId: string;
  filteredParticipants?: Array<{
    votes: Array<{ optionId: string; type: VoteType }>;
  }>;
}> = ({ optionId, filteredParticipants }) => {
  const { getScore, highScore, poll } = usePoll();

  const { yes, ifNeedBe } = React.useMemo(() => {
    if (filteredParticipants) {
      return filteredParticipants.reduce(
        (acc, p) => {
          for (const vote of p.votes) {
            if (vote.optionId === optionId) {
              if (vote.type === "yes") {
                acc.yes += 1;
              } else if (vote.type === "ifNeedBe") {
                acc.ifNeedBe += 1;
              }
            }
          }
          return acc;
        },
        { yes: 0, ifNeedBe: 0 },
      );
    }
    const s = getScore(optionId);
    return { yes: s.yes, ifNeedBe: s.ifNeedBe };
  }, [filteredParticipants, getScore, optionId]);

  const effectiveHighScore = React.useMemo(() => {
    if (filteredParticipants) {
      return poll.options.reduce((acc, curr) => {
        let score = 0;
        for (const p of filteredParticipants) {
          for (const v of p.votes) {
            if (
              v.optionId === curr.id &&
              (v.type === "yes" || v.type === "ifNeedBe")
            ) {
              score += 1;
            }
          }
        }
        return score > acc ? score : acc;
      }, 1);
    }
    return highScore;
  }, [filteredParticipants, highScore, poll.options]);

  const score = yes + ifNeedBe;
  const highlight = score === effectiveHighScore && score > 0;

  return (
    <IfScoresVisible>
      <ScoreSummary
        yesScore={yes}
        ifNeedBeScore={ifNeedBe}
        highScore={effectiveHighScore}
        highlight={highlight}
        showTentative={poll.allowTentativeVotes}
      />
    </IfScoresVisible>
  );
};

function AnimatedNumber({ score }: { score: number }) {
  const prevScore = usePrevious(score);
  const direction = prevScore !== undefined ? score - prevScore : 0;

  return (
    <AnimatePresence initial={false} mode="wait">
      <m.span
        initial={{
          y: 10 * direction,
        }}
        transition={{
          duration: 0.1,
        }}
        animate={{ opacity: 1, y: 0 }}
        exit={{
          y: 10 * direction,
        }}
        key={score}
        className="relative"
      >
        {score}
      </m.span>
    </AnimatePresence>
  );
}

const ScoreSummary: React.FunctionComponent<PopularityScoreProps> = React.memo(
  function PopularityScore({
    yesScore = 0,
    ifNeedBeScore = 0,
    highlight,
    highScore,
    showTentative = true,
  }) {
    const score = yesScore + ifNeedBeScore;

    return (
      <span
        className={cn(
          "relative inline-flex items-center gap-x-1 text-xs",
          highlight
            ? "font-medium text-foreground"
            : "font-normal text-muted-foreground",
        )}
        style={{
          opacity: Math.max(score / highScore, 0.2),
        }}
      >
        <User2Icon className="size-4 opacity-75" />
        <AnimatedNumber score={score} />
        {highlight && showTentative ? (
          ifNeedBeScore > 0 ? (
            <span className="inline-block size-1.5 rounded-full bg-amber-400" />
          ) : null
        ) : null}
      </span>
    );
  },
);
