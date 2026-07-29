import tutorialsData from "../../data/tutorials.json";

export type Locale = "en" | "da";

export type LocalizedText = {
  en: string;
  da: string;
};

export type StepVideo =
  | { type: "vimeo"; id: string }
  | { type: "local"; src: string };

export type Step = {
  id: string;
  title: LocalizedText;
  caption?: LocalizedText;
  content: LocalizedText;
  image?: string;
  video?: StepVideo;
};

export type StepsTutorial = {
  id: string;
  title: LocalizedText;
  steps: Step[];
};

export type ChoicesTutorial = {
  id: string;
  title: LocalizedText;
  choices: string[];
};

export type Tutorial = StepsTutorial | ChoicesTutorial;

function assertLocalizedText(value: unknown, field: string, label: string): asserts value is LocalizedText {
  const text = value as Partial<LocalizedText> | undefined;
  if (!text || typeof text.en !== "string" || !text.en) {
    throw new Error(`${label}: missing "${field}.en"`);
  }
  if (typeof text.da !== "string" || !text.da) {
    throw new Error(`${label}: missing "${field}.da"`);
  }
}

function validateStep(raw: unknown, tutorialLabel: string, index: number): Step {
  const position = index + 1;
  const step = raw as Record<string, unknown>;
  const label = `${tutorialLabel}, Step ${position}`;

  if (typeof step.id !== "string" || !step.id) {
    throw new Error(`${label}: missing "id"`);
  }
  assertLocalizedText(step.title, "title", label);
  if (step.caption !== undefined) {
    assertLocalizedText(step.caption, "caption", label);
  }
  assertLocalizedText(step.content, "content", label);

  if (step.image !== undefined && typeof step.image !== "string") {
    throw new Error(`${label}: "image" must be a string path`);
  }

  if (step.video !== undefined) {
    const video = step.video as Record<string, unknown>;
    if (video.type === "vimeo") {
      if (typeof video.id !== "string" || !video.id) {
        throw new Error(`${label}: video.type is "vimeo" but "id" is missing`);
      }
    } else if (video.type === "local") {
      if (typeof video.src !== "string" || !video.src) {
        throw new Error(`${label}: video.type is "local" but "src" is missing`);
      }
    } else {
      throw new Error(`${label}: "video.type" must be "vimeo" or "local"`);
    }
  }

  return step as unknown as Step;
}

function validateTutorial(raw: unknown, index: number): Tutorial {
  const position = index + 1;
  const tutorial = raw as Record<string, unknown>;
  const id = typeof tutorial.id === "string" && tutorial.id ? tutorial.id : "(no id)";
  const label = `Tutorial ${position} ("${id}")`;

  if (typeof tutorial.id !== "string" || !tutorial.id) {
    throw new Error(`${label}: missing "id"`);
  }
  assertLocalizedText(tutorial.title, "title", label);

  const hasSteps = "steps" in tutorial;
  const hasChoices = "choices" in tutorial;

  if (hasSteps && hasChoices) {
    throw new Error(`${label}: cannot have both "steps" and "choices" — a tutorial is either one or the other`);
  }
  if (!hasSteps && !hasChoices) {
    throw new Error(`${label}: must have either "steps" or "choices"`);
  }

  if (hasChoices) {
    const choices = tutorial.choices;
    if (!Array.isArray(choices) || choices.length === 0) {
      throw new Error(`${label}: "choices" must be a non-empty array`);
    }
    if (!choices.every((c) => typeof c === "string" && c)) {
      throw new Error(`${label}: every entry in "choices" must be a non-empty string`);
    }
    if (new Set(choices).size !== choices.length) {
      throw new Error(`${label}: "choices" contains duplicate entries`);
    }
    return { id: tutorial.id, title: tutorial.title, choices } as ChoicesTutorial;
  }

  if (!Array.isArray(tutorial.steps) || tutorial.steps.length === 0) {
    throw new Error(`${label}: "steps" must be a non-empty array`);
  }

  return {
    id: tutorial.id,
    title: tutorial.title,
    steps: tutorial.steps.map((step, i) => validateStep(step, label, i)),
  } as StepsTutorial;
}

function loadTutorials(): Tutorial[] {
  const raw = (tutorialsData as { tutorials?: unknown[] }).tutorials;
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error('data/tutorials.json must contain a non-empty "tutorials" array');
  }

  const tutorials = raw.map((tutorial, index) => validateTutorial(tutorial, index));

  const seenIds = new Set<string>();
  for (const tutorial of tutorials) {
    if (seenIds.has(tutorial.id)) {
      throw new Error(`Duplicate tutorial id "${tutorial.id}" — tutorial ids must be unique`);
    }
    seenIds.add(tutorial.id);
  }

  const byId = new Map(tutorials.map((t) => [t.id, t]));
  for (const tutorial of tutorials) {
    if (!("choices" in tutorial)) continue;
    for (const choiceId of tutorial.choices) {
      const target = byId.get(choiceId);
      if (!target) {
        throw new Error(`Tutorial "${tutorial.id}": "choices" references unknown tutorial id "${choiceId}"`);
      }
      if ("choices" in target) {
        throw new Error(
          `Tutorial "${tutorial.id}": "choices" references "${choiceId}", which is itself a chooser — chained choosers are not supported`
        );
      }
    }
  }

  return tutorials;
}

export const tutorials: Tutorial[] = loadTutorials();

export function getTutorial(id: string): Tutorial | undefined {
  return tutorials.find((tutorial) => tutorial.id === id);
}

// Tutorials referenced by some chooser's "choices" are reached only via that
// chooser, so they're excluded from the arrival page's own top-level list.
export function getTopLevelTutorials(): Tutorial[] {
  const referenced = new Set(tutorials.flatMap((t) => ("choices" in t ? t.choices : [])));
  return tutorials.filter((t) => !referenced.has(t.id));
}

export function getChooserFor(tutorialId: string): ChoicesTutorial | undefined {
  return tutorials.find((t): t is ChoicesTutorial => "choices" in t && t.choices.includes(tutorialId));
}
