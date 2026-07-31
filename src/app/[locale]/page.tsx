import Link from "next/link";
import { notFound } from "next/navigation";
import HouseIllustration from "@/components/HouseIllustration";
import HuslejenaevnLogo from "@/components/HuslejenaevnLogo";
import { getTopLevelTutorials, type Locale } from "@/lib/tutorials";

const LOCALES: Locale[] = ["en", "da"];

const UI_TEXT: Record<Locale, { heading: string; subheading: string; search: string }> = {
  en: {
    heading: "Welcome to the Huslejenaevn.dk training environment",
    subheading: "Choose a tutorial to get started.",
    search: "Search tutorials",
  },
  da: {
    heading: "Velkommen til uddannelsesmiljøet for Huslejenaevn.dk",
    subheading: "Vælg en vejledning for at komme i gang.",
    search: "Søg i vejledninger",
  },
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
      <HouseIllustration className="mx-auto mb-4 h-44 w-44" />
      <HuslejenaevnLogo className="mb-6 text-2xl" />
      <h1 className="mb-2 text-center text-2xl font-bold text-[var(--text-primary)]">{t.heading}</h1>
      <p className="mb-8 text-center text-sm text-[var(--text-secondary)]">{t.subheading}</p>

      <Link
        href={`/${locale}/search`}
        className="mb-6 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-5 py-4 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent)]"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="h-4 w-4 shrink-0 text-[var(--accent)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="8.5" cy="8.5" r="6" />
          <line x1="13.2" y1="13.2" x2="18" y2="18" strokeLinecap="round" />
        </svg>
        {t.search}
      </Link>

      <ul className="space-y-3">
        {getTopLevelTutorials().map((tutorial) => (
          <li key={tutorial.id}>
            <Link
              href={"choices" in tutorial ? `/${locale}/${tutorial.id}` : `/${locale}/${tutorial.id}/1`}
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
