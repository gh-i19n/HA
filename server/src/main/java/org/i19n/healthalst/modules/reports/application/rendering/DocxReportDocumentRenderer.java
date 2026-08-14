package org.i19n.healthalst.modules.reports.application.rendering;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.springframework.stereotype.Component;

/** Eventorch-derived Apache POI renderer for the same canonical imaging document. */
@Component
public class DocxReportDocumentRenderer implements ReportDocumentRenderer {
    @Override public String format() { return "docx"; }
    @Override public String contentType() { return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"; }
    @Override public String extension() { return "docx"; }

    @Override
    public byte[] render(ReportDocument model) {
        try (XWPFDocument document = new XWPFDocument()) {
            paragraph(document, model.clinicName(), 22, true, "16335B");
            paragraph(document, value(model.clinicAddress(), "Diagnostic imaging services"), 9, false, "64748B");
            paragraph(document, model.template().title(), 18, true, "0F172A");
            field(document, "Patient", model.patientName());
            field(document, "Booking reference", model.bookingReference());
            field(document, "Examination", model.template().examination());
            field(document, "Examination date", value(model.examinationDate(), "Not provided"));
            field(document, "Report date", value(model.reportDate(), "Not provided"));
            section(document, "Clinical indication", model.content().clinicalIndication());
            section(document, "Technique", model.content().technique());
            section(document, "Comparison", model.content().comparison());
            section(document, "Findings", model.content().findings());
            section(document, "Impression", model.content().impression());
            field(document, "Reported by", model.content().reportingProfessional());
            field(document, "Professional title", model.content().professionalTitle());
            paragraph(document, "Electronically prepared in HealthAlst · Confidential medical record", 8, false, "64748B");
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            document.write(output);
            return output.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("DOCX generation failed", exception);
        }
    }

    private void section(XWPFDocument document, String label, String value) {
        paragraph(document, label.toUpperCase(), 11, true, "16335B");
        paragraph(document, value(value, "Not provided"), 11, false, "1E293B");
    }
    private void field(XWPFDocument document, String label, String value) {
        XWPFParagraph paragraph = document.createParagraph();
        paragraph.setSpacingAfter(80);
        XWPFRun key = paragraph.createRun();
        key.setText(label + ": "); key.setBold(true); key.setFontSize(10);
        XWPFRun content = paragraph.createRun();
        content.setText(value(value, "Not provided")); content.setFontSize(10);
    }
    private void paragraph(XWPFDocument document, String value, int size, boolean bold, String color) {
        XWPFParagraph paragraph = document.createParagraph();
        paragraph.setSpacingAfter(120);
        XWPFRun run = paragraph.createRun();
        run.setText(value(value, "")); run.setFontSize(size); run.setBold(bold); run.setColor(color);
    }
    private static String value(String value, String fallback) { return value == null || value.isBlank() ? fallback : value; }
    private static String value(LocalDate value, String fallback) { return value == null ? fallback : value.toString(); }
}
