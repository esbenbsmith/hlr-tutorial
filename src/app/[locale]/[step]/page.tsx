import Link from "next/link";
import { notFound } from "next/navigation";
import { withBasePath } from "@/lib/basePath";
import { steps, type Locale } from "@/lib/steps";

const LOCALES: Locale[] = ["en", "da"];

const UI_TEXT: Record<Locale, { stepOf: string; back: string; next: string; done: string }> = {
  en: { stepOf: "Step {n} of {total}", back: "Back", next: "Next", done: "You're done!" },
  da: { stepOf: "Trin {n} af {total}", back: "Tilbage", next: "Næste", done: "Du er færdig!" },
};

export async function generateStaticParams() {
  const params: { locale: string; step: string }[] = [];
  for (const locale of LOCALES) {
    for (let i = 1; i <= steps.length; i++) {
      params.push({ locale, step: String(i) });
    }
  }
  return params;
}

export default async function StepPage({
  params,
}: {
  params: Promise<{ locale: string; step: string }>;
}) {
  const { locale: rawLocale, step: stepParam } = await params;
  if (!LOCALES.includes(rawLocale as Locale)) {
    notFound();
  }
  const locale = rawLocale as Locale;

  const stepNumber = Number(stepParam);
  const stepIndex = stepNumber - 1;
  const step = steps[stepIndex];
  if (!Number.isInteger(stepNumber) || !step) {
    notFound();
  }

  const total = steps.length;
  const current = stepIndex + 1;
  const t = UI_TEXT[locale];
  const prevHref = current > 1 ? `/${locale}/${current - 1}` : null;
  const nextHref = current < total ? `/${locale}/${current + 1}` : null;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-12">
      <div className="mb-6">
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

      <div className="mb-8 space-y-3 text-sm leading-relaxed text-[var(--text-secondary)]">
        {step.content[locale].split(/\n\s*\n/).map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-4">
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
          <span className="text-sm text-[var(--text-muted)]">{t.done}</span>
        )}
      </div>
    </main>
  );
}
