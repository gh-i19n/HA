"use client";

import { Icon } from "@healthalst/ui/lib/icons/icon";
import { cn } from "@healthalst/ui/lib/utils";
import type { ReportPreview, ReportPreviewFact, ReportPreviewSection } from "../types";

/** Splits extracted text on blank lines, preserving the PDF's paragraph breaks. */
function toParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** Renders one readable chapter of the imaging report. */
function ReportSection({ heading, body }: ReportPreviewSection) {
  return (
    <section className={cn("min-w-0 border-t border-border pt-6")}>
      <h3 className={cn("m-0 text-base font-semibold text-foreground")}>
        {heading}
      </h3>
      <p className={cn("m-0 mt-2 break-words text-sm leading-relaxed text-foreground-muted")}>
        {body.trim()}
      </p>
    </section>
  );
}

/** Displays a labelled header fact without introducing another card. */
function ReportFact({ label, value }: ReportPreviewFact) {
  if (!value) return null;
  return (
    <div className={cn("min-w-0")}>
      <dt className={cn("text-xs font-semibold text-foreground-muted")}>{label}</dt>
      <dd className={cn("m-0 mt-1 break-words text-sm leading-relaxed text-foreground")}>{value}</dd>
    </div>
  );
}

/**
 * Renderer-free imaging report document, modelled on Eventorch's concept
 * approval preview: a masthead with clinical facts followed by the canonical
 * sections (or extracted paragraphs for uploaded documents).
 */
export function ReportPreviewDocument({ preview }: { readonly preview: ReportPreview }) {
  const paragraphs = preview.extractedText ? toParagraphs(preview.extractedText) : [];
  const isStructured = preview.sections.length > 0;

  return (
    <article className={cn("mx-auto min-w-0 max-w-3xl space-y-8 px-1 pb-2")}>
      <header className={cn("rounded-2xl bg-surface-subtle p-5 sm:p-6")}>
        <div className={cn("flex items-center justify-between gap-3")}>
          <p className={cn("m-0 text-xs font-semibold uppercase tracking-widest text-primary")}>
            {preview.clinicName || "Imaging report"}
          </p>
          <span className={cn("rounded-full bg-success-subtle px-2.5 py-1 text-[10px] font-semibold text-success")}>
            {preview.status === "AVAILABLE" ? "Available" : "Pending review"}
          </span>
        </div>
        {preview.clinicAddress ? (
          <p className={cn("m-0 mt-1 text-xs text-foreground-muted")}>{preview.clinicAddress}</p>
        ) : null}
        <h2 className={cn("m-0 mt-4 break-words font-serif text-2xl font-semibold leading-tight text-foreground")}>
          {preview.facts.find((fact) => fact.label === "Examination")?.value ?? "Imaging report"}
        </h2>
        <dl className={cn("m-0 mt-6 grid min-w-0 grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3")}>
          {preview.facts.map((fact) => (
            <ReportFact key={fact.label} label={fact.label} value={fact.value} />
          ))}
        </dl>
      </header>

      {isStructured ? (
        <div className={cn("min-w-0 space-y-8")}>
          {preview.sections.map((section) => (
            <ReportSection key={section.heading} heading={section.heading} body={section.body} />
          ))}
        </div>
      ) : paragraphs.length > 0 ? (
        <div className={cn("space-y-4")}>
          {paragraphs.map((paragraph, index) => (
            <p key={`${index}-${paragraph.slice(0, 24)}`} className={cn("m-0 break-words text-sm leading-relaxed text-foreground")}>
              {paragraph}
            </p>
          ))}
        </div>
      ) : (
        <div className={cn("flex items-start gap-2.5 rounded-xl bg-surface p-5 text-sm text-foreground-muted")}>
          <Icon className={cn("mt-0.5 shrink-0")} name="Info" size={15} />
          <p className={cn("m-0")}>
            This document has no extractable text preview. Download the original PDF to view its contents.
          </p>
        </div>
      )}

      <footer className={cn("border-t border-border pt-4")}>
        <p className={cn("m-0 text-xs leading-relaxed text-foreground-muted")}>
          Electronically prepared in HealthAlst · Confidential medical record. Each download is
          authorized again when you open it.
        </p>
      </footer>
    </article>
  );
}
