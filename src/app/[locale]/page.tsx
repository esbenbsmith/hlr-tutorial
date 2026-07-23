import Link from "next/link";
import { notFound } from "next/navigation";
import { tutorials, type Locale } from "@/lib/tutorials";

const LOCALES: Locale[] = ["en", "da"];

const UI_TEXT: Record<Locale, { heading: string; subheading: string }> = {
  en: { heading: "Tutorials", subheading: "Choose a tutorial to get started." },
  da: { heading: "Vejledninger", subheading: "Vælg en vejledning for at komme i gang." },
};

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function TutorialsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!LOCALES.includes(rawLocale as Locale)) {
    notFound();
  }
  const locale = rawLocale as Locale;
  const t = UI_TEXT[locale];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-12">
      <h1 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">{t.heading}</h1>
      <p className="mb-8 text-sm text-[var(--text-secondary)]">{t.subheading}</p>

      <ul className="space-y-3">
        {tutorials.map((tutorial) => (
          <li key={tutorial.id}>
            <Link
              href={`/${locale}/${tutorial.id}/1`}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-5 py-4 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent)]"
            >
              {tutorial.title[locale]}
              <span aria-hidden className="text-[var(--accent)]">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
