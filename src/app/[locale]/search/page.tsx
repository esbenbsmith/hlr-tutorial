import Link from "next/link";
import { notFound } from "next/navigation";
import { getSearchIndex, type Locale } from "@/lib/tutorials";
import SearchClient from "./SearchClient";

const LOCALES: Locale[] = ["en", "da"];

const UI_TEXT: Record<Locale, { heading: string; allTutorials: string }> = {
  en: { heading: "Search tutorials", allTutorials: "All tutorials" },
  da: { heading: "Søg i vejledninger", allTutorials: "Alle vejledninger" },
};

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function SearchPage({
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
  const index = getSearchIndex(locale);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-12">
      <div className="mb-4">
        <Link href={`/${locale}`} className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)]">
          ← {t.allTutorials}
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">{t.heading}</h1>

      <SearchClient locale={locale} index={index} />
    </main>
  );
}
