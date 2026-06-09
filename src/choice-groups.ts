interface ChoiceDisplayItem {
  label: string;
  choiceGroup?: string;
}

export interface ChoiceDisplayGroup<T extends ChoiceDisplayItem> {
  label?: string;
  choices: T[];
}

const MIN_GROUPED_CHOICE_COUNT = 8;

const GROUP_ORDER = [
  "Finish Mara's handoff",
  "Board / release",
  "Shared room / release",
  "Thumbprint oath",
  "Thumbprint receipt",
  "Mara and manifest",
  "Mara",
  "Manifest count",
  "Shared count",
  "Lunch tin count",
  "Lunch tin roster",
  "Counts / answers",
  "Final roll call",
  "Passenger gathering",
  "Door echoes",
  "Threshold holding",
  "Morning stops",
  "Keepsakes / memories",
  "Passenger threads",
  "Return",
  "Investigate",
  "Other"
];

export function groupChoicesForDisplay<T extends ChoiceDisplayItem>(
  choices: T[]
): ChoiceDisplayGroup<T>[] {
  if (choices.length < MIN_GROUPED_CHOICE_COUNT) return [{ choices }];

  if (choices.some((choice) => choice.choiceGroup)) {
    return groupByChoiceGroup(choices);
  }

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

function groupByChoiceGroup<T extends ChoiceDisplayItem>(choices: T[]): ChoiceDisplayGroup<T>[] {
  const grouped = new Map<string, { choices: T[]; firstIndex: number }>();

  choices.forEach((choice, index) => {
    const label = choice.choiceGroup ?? classifyChoiceLabel(choice.label);
    const group = grouped.get(label) ?? { choices: [], firstIndex: index };
    group.choices.push(choice);
    grouped.set(label, group);
  });

  if (grouped.size <= 1) return [{ choices }];

  return [...grouped.entries()]
    .sort(([leftLabel, left], [rightLabel, right]) => {
      const leftOrder = groupOrder(leftLabel);
      const rightOrder = groupOrder(rightLabel);
      if (leftOrder !== rightOrder) return leftOrder - rightOrder;
      return left.firstIndex - right.firstIndex;
    })
    .map(([label, group]) => ({
      label,
      choices: group.choices
    }));
}

function groupOrder(label: string): number {
  const index = GROUP_ORDER.indexOf(label);
  if (index !== -1) return index;

  const otherIndex = GROUP_ORDER.indexOf("Other");
  return otherIndex === -1 ? Number.MAX_SAFE_INTEGER : otherIndex - 0.5;
}

function classifyChoiceLabel(label: string): string {
  const normalized = label.toLowerCase();

  if (/\b(final roll call|passengers' own roll call|passengers' roll call)\b/.test(normalized)) {
    return "Final roll call";
  }

  if (
    /\bthumbprint\b.*\b(receipt|receive|received|reaches|reach)\b|\b(receipt|receive|received|reaches|reach)\b.*\bthumbprint\b/.test(
      normalized
    )
  ) {
    return "Thumbprint receipt";
  }

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

  if (/\b(morning|remembered stops|morning stop|stops)\b/.test(normalized)) {
    return "Morning stops";
  }

  if (/\b(newspaper|mitten|keepsake|keepsakes|lunch[- ]tin|memory|transfer)\b/.test(normalized)) {
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
