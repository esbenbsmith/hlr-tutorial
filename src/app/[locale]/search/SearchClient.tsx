"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Locale, SearchEntry } from "@/lib/tutorials";

const UI_TEXT: Record<Locale, { placeholder: string; noResults: string; resultsCount: string }> = {
  en: {
    placeholder: "Search for a topic, e.g. \"tenancy\" or \"pseudonymize\"...",
    noResults: "No steps match your search.",
    resultsCount: "{n} matching steps",
  },
  da: {
    placeholder: "Søg efter et emne, f.eks. \"lejemål\" eller \"pseudonymisér\"...",
    noResults: "Ingen trin matcher din søgning.",
    resultsCount: "{n} matchende trin",
  },
};

export default function SearchClient({ locale, index }: { locale: Locale; index: SearchEntry[] }) {
  const [query, setQuery] = useState("");
  const t = UI_TEXT[locale];

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return index.filter((entry) => entry.searchText.includes(needle));
  }, [query, index]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.placeholder}
        autoFocus
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
      />

      {query.trim() && (
        <p className="mt-4 mb-2 text-xs text-[var(--text-muted)]">
          {t.resultsCount.replace("{n}", String(results.length))}
        </p>
      )}

      {query.trim() && results.length === 0 && (
        <p className="mt-4 text-sm text-[var(--text-secondary)]">{t.noResults}</p>
      )}

      <ul className="space-y-3">
        {results.map((entry) => (
          <li key={`${entry.tutorialId}-${entry.stepNumber}`}>
            <Link
              href={`/${locale}/${entry.tutorialId}/${entry.stepNumber}`}
              className="flex flex-col rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-5 py-4 transition-colors hover:border-[var(--accent)]"
            >
              <span className="text-xs font-medium text-[var(--accent)]">{entry.tutorialTitle}</span>
              <span className="text-sm font-medium text-[var(--text-primary)]">{entry.stepTitle}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
