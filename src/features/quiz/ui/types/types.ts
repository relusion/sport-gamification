/** Resolved (translated) answer option fed to a type-card renderer. */
export interface AnswerOption {
  id: string;
  label: string;
  hint?: string;
}

/** Common shape for every type-card. Renderers decide selection semantics. */
export interface TypeCardProps {
  questionId: string;
  prompt: string;
  subtitle?: string;
  answers: AnswerOption[];
  /** Currently committed/draft answer ids for this question. */
  value: string[];
  /** Reports the new answerId selection (commit happens on NEXT). */
  onChange: (answerIds: string[]) => void;
  /** Optional ARIA group label; falls back to prompt. */
  ariaLabel?: string;
}
