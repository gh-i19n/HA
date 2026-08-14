package org.i19n.healthalst.modules.reports.interfaces.dto;

import java.util.List;

/** Renderer-free preview payload: canonical sections or extracted text plus header facts. */
public record ReportPreviewResponse(
        String clinicName,
        String clinicAddress,
        List<Fact> facts,
        List<Section> sections,
        String extractedText,
        String status
) {
    public record Fact(String label, String value) {}

    public record Section(String heading, String body) {}
}
