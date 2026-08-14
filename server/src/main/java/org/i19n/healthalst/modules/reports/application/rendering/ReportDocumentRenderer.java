package org.i19n.healthalst.modules.reports.application.rendering;

/** Reusable renderer contract adapted from Eventorch's DocumentRenderer. */
public interface ReportDocumentRenderer {
    String format();
    String contentType();
    String extension();
    byte[] render(ReportDocument document);
}
