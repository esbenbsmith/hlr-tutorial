import Link from "next/link";
import { notFound } from "next/navigation";
import { tutorials, getTutorial, type Locale } from "@/lib/tutorials";

const LOCALES: Locale[] = ["en", "da"];

const UI_TEXT: Record<Locale, { allTutorials: string; instruction: string }> = {
  en: { allTutorials: "All tutorials", instruction: "Choose the role that matches you." },
  da: { allTutorials: "Alle vejledninger", instruction: "Vælg den rolle, der passer til dig." },
};

export async function generateStaticParams() {
  const params: { locale: string; tutorial: string }[] = [];
  for (const locale of LOCALES) {
    for (const tutorial of tutorials) {
      if ("choices" in tutorial) {
        params.push({ locale, tutorial: tutorial.id });
      }
    }
  }
  return params;
}

export default async function TutorialChooserPage({
  params,
}: {
  params: Promise<{ locale: string; tutorial: string }>;
}) {
  const { locale: rawLocale, tutorial: tutorialId } = await params;
  if (!LOCALES.includes(rawLocale as Locale)) {
    notFound();
  }
  const locale = rawLocale as Locale;

  const tutorial = getTutorial(tutorialId);
  if (!tutorial || !("choices" in tutorial)) {
    notFound();
  }

  const t = UI_TEXT[locale];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-12">
      <div className="mb-4">
        <Link href={`/${locale}`} className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)]">
          ← {t.allTutorials}
        </Link>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">{tutorial.title[locale]}</h1>
      <p className="mb-8 text-sm text-[var(--text-secondary)]">{t.instruction}</p>

      <ul className="space-y-3">
        {tutorial.choices.map((choiceId) => {
          const choice = getTutorial(choiceId);
          if (!choice) return null;
          return (
            <li key={choiceId}>
              <Link
                href={`/${locale}/${choiceId}/1`}
                className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-5 py-4 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent)]"
              >
                {choice.title[locale]}
                <span aria-hidden className="text-[var(--accent)]">
                  →
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
