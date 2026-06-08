export interface ChoiceDisplayGroup<T extends { label: string }> {
  label?: string;
  choices: T[];
}

const MIN_GROUPED_CHOICE_COUNT = 8;

const GROUP_ORDER = [
  "Board / release",
  "Mara",
  "Counts / answers",
  "Keepsakes / memories",
  "Passenger threads",
  "Return",
  "Investigate",
  "Other"
];

export function groupChoicesForDisplay<T extends { label: string }>(
  choices: T[]
): ChoiceDisplayGroup<T>[] {
  if (choices.length < MIN_GROUPED_CHOICE_COUNT) return [{ choices }];

  const grouped = new Map<string, T[]>();
  for (const choice of choices) {
    const group = classifyChoiceLabel(choice.label);
    grouped.set(group, [...(grouped.get(group) ?? []), choice]);
  }

  if (grouped.size <= 1) return [{ choices }];

  return GROUP_ORDER.filter((label) => grouped.has(label)).map((label) => ({
    label,
    choices: grouped.get(label) ?? []
  }));
}

function classifyChoiceLabel(label: string): string {
  const normalized = label.toLowerCase();

  if (
    /^(pull|board|cross|make room|hold the third-car|lead|start the release|step into|leave|reach)\b/.test(
      normalized
    )
  ) {
    return "Board / release";
  }

  if (/\b(mara|badge|dispatch|thumbprint|handoff|speaker|intercom)\b/.test(normalized)) {
    return "Mara";
  }

  if (
    /\b(count|answer|answers|roll call|roll-call|roster|conductor|punch|proof|clearance)\b/.test(
      normalized
    )
  ) {
    return "Counts / answers";
  }

  if (
    /\b(newspaper|mitten|keepsake|keepsakes|lunch[- ]tin|memory|transfer|morning stop|stops)\b/.test(
      normalized
    )
  ) {
    return "Keepsakes / memories";
  }

  if (
    /\b(passenger|passengers|manifest|door|doors|gather|echo|room|threshold)\b/.test(normalized)
  ) {
    return "Passenger threads";
  }

  if (/^(return|back|retreat)\b/.test(normalized)) {
    return "Return";
  }

  if (
    /\b(read|inspect|check|listen|notice|ask|study|review|search|look|pause|follow|carry|let)\b/.test(
      normalized
    )
  ) {
    return "Investigate";
  }

  return "Other";
}
