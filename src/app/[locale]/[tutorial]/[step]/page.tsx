import Link from "next/link";
import { notFound } from "next/navigation";
import { withBasePath } from "@/lib/basePath";
import { tutorials, getTutorial, getChooserFor, type Locale } from "@/lib/tutorials";

const LOCALES: Locale[] = ["en", "da"];

const UI_TEXT: Record<Locale, { stepOf: string; back: string; next: string; allTutorials: string }> = {
  en: { stepOf: "Step {n} of {total}", back: "Back", next: "Next", allTutorials: "All tutorials" },
  da: { stepOf: "Trin {n} af {total}", back: "Tilbage", next: "Næste", allTutorials: "Alle vejledninger" },
};

function renderWithBold(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-[var(--text-primary)]">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

function renderParagraphs(text: string) {
  const blocks: React.ReactNode[] = [];
  let currentList: { text: string; subItems: string[] }[] = [];
  let lastItemAcceptsSubItems = false;
  let key = 0;

  const flushList = () => {
    if (currentList.length === 0) return;
    blocks.push(
      <ul key={key++} className="list-disc space-y-1 pl-5">
        {currentList.map((item, i) => (
          <li key={i}>
            {renderWithBold(item.text)}
            {item.subItems.length > 0 && (
              <ul className="mt-1 list-[circle] space-y-1 pl-5 text-[var(--text-muted)]">
                {item.subItems.map((sub, j) => (
                  <li key={j}>{renderWithBold(sub)}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    );
    currentList = [];
    lastItemAcceptsSubItems = false;
  };

  for (const paragraph of text.split(/\n\s*\n/)) {
    const mainMatch = paragraph.match(/^•\s+([\s\S]*)$/);
    const subMatch = paragraph.match(/^-\s+([\s\S]*)$/);
    if (mainMatch) {
      currentList.push({ text: mainMatch[1], subItems: [] });
      lastItemAcceptsSubItems = true;
    } else if (subMatch && lastItemAcceptsSubItems) {
      currentList[currentList.length - 1].subItems.push(subMatch[1]);
    } else if (subMatch) {
      currentList.push({ text: subMatch[1], subItems: [] });
      lastItemAcceptsSubItems = false;
    } else {
      flushList();
      blocks.push(<p key={key++}>{renderWithBold(paragraph)}</p>);
    }
  }
  flushList();

  return blocks;
}

export async function generateStaticParams() {
  const params: { locale: string; tutorial: string; step: string }[] = [];
  for (const locale of LOCALES) {
    for (const tutorial of tutorials) {
      if (!("steps" in tutorial)) continue;
      for (let i = 1; i <= tutorial.steps.length; i++) {
        params.push({ locale, tutorial: tutorial.id, step: String(i) });
      }
    }
  }
  return params;
}

export default async function StepPage({
  params,
}: {
  params: Promise<{ locale: string; tutorial: string; step: string }>;
}) {
  const { locale: rawLocale, tutorial: tutorialId, step: stepParam } = await params;
  if (!LOCALES.includes(rawLocale as Locale)) {
    notFound();
  }
  const locale = rawLocale as Locale;

  const tutorial = getTutorial(tutorialId);
  if (!tutorial || !("steps" in tutorial)) {
    notFound();
  }

  const stepNumber = Number(stepParam);
  const stepIndex = stepNumber - 1;
  const step = tutorial.steps[stepIndex];
  if (!Number.isInteger(stepNumber) || !step) {
    notFound();
  }

  const total = tutorial.steps.length;
  const current = stepIndex + 1;
  const t = UI_TEXT[locale];
  const chooser = getChooserFor(tutorial.id);
  const prevHref =
    current > 1
      ? `/${locale}/${tutorial.id}/${current - 1}`
      : chooser
        ? `/${locale}/${chooser.id}`
        : null;
  const nextHref = current < total ? `/${locale}/${tutorial.id}/${current + 1}` : null;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col px-6 py-12">
      <div className="mb-4">
        <Link
          href={`/${locale}`}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)]"
        >
          ← {t.allTutorials}
        </Link>
      </div>

      <div className="mb-6">
        <p className="mb-1 text-xs font-medium text-[var(--accent)]">{tutorial.title[locale]}</p>
        <p className="mb-2 text-xs text-[var(--text-muted)]">
          {t.stepOf.replace("{n}", String(current)).replace("{total}", String(total))}
        </p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full bg-[var(--accent)]"
            style={{ width: `${(current / total) * 100}%` }}
          />
        </div>
      </div>

      <h1 className="mb-4 text-2xl font-bold text-[var(--text-primary)]">{step.title[locale]}</h1>

      {step.caption && (
        <div className="mb-4 space-y-3 text-base leading-relaxed text-[var(--text-primary)]">
          {renderParagraphs(step.caption[locale])}
        </div>
      )}

      {step.image && (
        // eslint-disable-next-line @next/next/no-img-element -- path comes from JSON content, dimensions vary per step
        <img
          src={withBasePath(step.image)}
          alt=""
          className="mb-4 w-full rounded-lg border border-[var(--border)]"
        />
      )}

      {step.video &&
        (step.video.type === "vimeo" ? (
          <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg border border-[var(--border)] bg-black">
            <iframe
              src={`https://player.vimeo.com/video/${step.video.id}?dnt=1`}
              title={step.title[locale]}
              className="h-full w-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg border border-[var(--border)] bg-black">
            <video controls className="h-full w-full" src={withBasePath(step.video.src)} />
          </div>
        ))}

      {step.content && (
        <div className="mb-8 space-y-3 text-base leading-relaxed text-[var(--text-secondary)]">
          {renderParagraphs(step.content[locale])}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-4">
        {prevHref ? (
          <Link
            href={prevHref}
            className="rounded border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--surface-1)]"
          >
            ← {t.back}
          </Link>
        ) : (
          <span />
        )}
        {nextHref ? (
          <Link
            href={nextHref}
            className="rounded bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-dark)]"
          >
            {t.next} →
          </Link>
        ) : (
          <Link
            href={`/${locale}`}
            className="rounded bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-dark)]"
          >
            {t.allTutorials} →
          </Link>
        )}
      </div>
    </main>
  );
}
