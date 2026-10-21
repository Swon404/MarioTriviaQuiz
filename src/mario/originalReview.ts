import type { TriviaQuestion } from './questions.ts';

// Explicitly reviewed records only: future additions must bring their own review.
export const ORIGINAL_REVIEW_GROUPS = [
  ['Super Mario series — Nintendo character guide', ['mario-professor-7', 'mario-professor-8', 'mario-professor-9', 'expanded-5', 'expanded-7', 'expanded-14', 'expanded-21']],
  ['Mario Kart World — launch rules', ['kart-explorer-1', 'kart-explorer-2', 'kart-explorer-3', 'kart-explorer-4', 'kart-explorer-5', 'kart-explorer-6', 'kart-explorer-10', 'kart-scientist-10', 'kart-professor-8', 'kart-professor-9', 'kart-professor-10', 'expanded-26', 'expanded-27', 'expanded-28', 'expanded-35', 'expanded-42', 'fresh-19', 'fresh-20', 'fresh-25', 'fresh-31', 'fresh-32', 'fresh-36']],
  ['Mario Kart World — developer interview, part 3', ['fresh-21']],
  ['Mario Kart Wii — Coconut Mall route guide', ['kart-explorer-7']],
  ['Mario Kart 64 — original courses', ['kart-explorer-9']],
  ['Mario Kart 8 Deluxe — complete Booster Course Pass', ['kart-scientist-1', 'kart-scientist-2', 'kart-scientist-3', 'kart-scientist-4', 'kart-scientist-5', 'kart-scientist-6', 'kart-scientist-7', 'kart-scientist-8', 'kart-scientist-9', 'kart-professor-1', 'kart-professor-2', 'kart-professor-3', 'kart-professor-4', 'kart-professor-5', 'kart-professor-6', 'kart-professor-7', 'expanded-29', 'expanded-30', 'expanded-36', 'expanded-37', 'fresh-23', 'fresh-28', 'fresh-29', 'fresh-30', 'fresh-33', 'fresh-34', 'fresh-35']],
  ['Mario Kart 8 Deluxe — Wave 3 course guide', ['fresh-24']],
  ['Super Mario Bros. Wonder — Nintendo power-up guide', ['expanded-3', 'expanded-15', 'expanded-16']],
  ['Super Mario Party (2018) — character guide', ['expanded-4', 'expanded-10', 'expanded-11', 'expanded-17']],
  ['Super Mario series — Dry Bones character guide', ['expanded-18']],
  ['Super Mario Maker — original Wii U game (2015)', ['expanded-6']],
  ['Super Mario Galaxy — original Wii controls', ['expanded-12']],
  ['Mario — early naming history', ['expanded-19', 'fresh-14']],
  ['Mario Kart 8 Deluxe — Wave 2 debut', ['expanded-22']],
  ['Mario Kart Tour — App Store Ninja Tour guide', ['expanded-23']],
  ['Super Mario 3D World — power-up guide', ['fresh-5']],
] as const;

const editions = new Map<string, string>(ORIGINAL_REVIEW_GROUPS.flatMap(([edition, ids]) => ids.map(id => [id, edition] as const)));

export function withCompletedOriginalReview(question: TriviaQuestion): TriviaQuestion {
  if (question.sourceReview?.status === 'source-checked' && question.sourceReview.checkedOn > '2026-10-12') return question;
  const gameVersion = editions.get(question.id);
  return gameVersion ? { ...question, sourceReview: { checkedOn: '2026-10-12', status: 'source-checked', gameVersion } } : question;
}
