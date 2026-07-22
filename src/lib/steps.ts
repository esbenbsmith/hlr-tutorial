import stepsData from "../../data/steps.json";

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

function describeStep(step: Record<string, unknown>, position: number): string {
  const id = typeof step.id === "string" && step.id ? step.id : "(no id)";
  return `Step ${position} ("${id}")`;
}

function assertLocalizedText(value: unknown, field: string, label: string): asserts value is LocalizedText {
  const text = value as Partial<LocalizedText> | undefined;
  if (!text || typeof text.en !== "string" || !text.en) {
    throw new Error(`${label}: missing "${field}.en"`);
  }
  if (typeof text.da !== "string" || !text.da) {
    throw new Error(`${label}: missing "${field}.da"`);
  }
}

function validateStep(raw: unknown, index: number): Step {
  const position = index + 1;
  const step = raw as Record<string, unknown>;
  const label = describeStep(step, position);

  if (typeof step.id !== "string" || !step.id) {
    throw new Error(`Step ${position}: missing "id"`);
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

function loadSteps(): Step[] {
  const raw = (stepsData as { steps?: unknown[] }).steps;
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error('data/steps.json must contain a non-empty "steps" array');
  }
  return raw.map((step, index) => validateStep(step, index));
}

export const steps: Step[] = loadSteps();
