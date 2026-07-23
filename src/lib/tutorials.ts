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
  content: LocalizedText;
  image?: string;
  video?: StepVideo;
};

export type Tutorial = {
  id: string;
  title: LocalizedText;
  steps: Step[];
};

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

  if (!Array.isArray(tutorial.steps) || tutorial.steps.length === 0) {
    throw new Error(`${label}: "steps" must be a non-empty array`);
  }

  return {
    ...tutorial,
    steps: tutorial.steps.map((step, i) => validateStep(step, label, i)),
  } as unknown as Tutorial;
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

  return tutorials;
}

export const tutorials: Tutorial[] = loadTutorials();

export function getTutorial(id: string): Tutorial | undefined {
  return tutorials.find((tutorial) => tutorial.id === id);
}
