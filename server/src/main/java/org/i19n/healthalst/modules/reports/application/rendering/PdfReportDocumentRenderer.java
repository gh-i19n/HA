package org.i19n.healthalst.modules.reports.application.rendering;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Component;

/** Eventorch-derived PDFBox renderer tailored to a calm imaging-centre document. */
@Component
public class PdfReportDocumentRenderer implements ReportDocumentRenderer {
    private static final float MARGIN = 58;
    private static final float WIDTH = PDRectangle.A4.getWidth() - (MARGIN * 2);

    @Override public String format() { return "pdf"; }
    @Override public String contentType() { return "application/pdf"; }
    @Override public String extension() { return "pdf"; }

    @Override
    public byte[] render(ReportDocument model) {
        try (PDDocument document = new PDDocument()) {
            PDType1Font regular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDType1Font bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PageWriter writer = new PageWriter(document, regular, bold);
            writer.heading(model.clinicName(), 20);
            writer.text(value(model.clinicAddress(), "Diagnostic imaging services"), 9);
            writer.rule();
            writer.heading(model.template().title(), 17);
            writer.field("Patient", model.patientName());
            writer.field("Booking reference", model.bookingReference());
            writer.field("Examination", model.template().examination());
            writer.field("Examination date", value(model.examinationDate(), "Not provided"));
            writer.field("Report date", value(model.reportDate(), "Not provided"));
            writer.rule();
            writer.section("Clinical indication", model.content().clinicalIndication());
            writer.section("Technique", model.content().technique());
            writer.section("Comparison", model.content().comparison());
            writer.section("Findings", model.content().findings());
            writer.section("Impression", model.content().impression());
            writer.rule();
            writer.field("Reported by", model.content().reportingProfessional());
            writer.field("Professional title", model.content().professionalTitle());
            writer.text("Electronically prepared in HealthAlst · Confidential medical record", 8);
            writer.close();
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            document.save(output);
            return output.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("PDF generation failed", exception);
        }
    }

    private static String value(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private static String value(LocalDate value, String fallback) {
        return value == null ? fallback : value.toString();
    }

    private static final class PageWriter {
        private final PDDocument document;
        private final PDType1Font regular;
        private final PDType1Font bold;
        private PDPage page;
        private PDPageContentStream stream;
        private float y;

        private PageWriter(PDDocument document, PDType1Font regular, PDType1Font bold) throws IOException {
            this.document = document;
            this.regular = regular;
            this.bold = bold;
            nextPage();
        }

        void heading(String text, float size) throws IOException { lines(text, bold, size, size + 6); y -= 8; }
        void text(String text, float size) throws IOException { lines(text, regular, size, size + 4); }
        void field(String label, String text) throws IOException {
            lines(label.toUpperCase(), bold, 8, 12);
            lines(value(text, "Not provided"), regular, 10.5f, 15);
            y -= 5;
        }
        void section(String label, String text) throws IOException {
            ensure(48);
            y -= 4;
            lines(label.toUpperCase(), bold, 9, 14);
            lines(value(text, "Not provided"), regular, 10.5f, 15);
            y -= 10;
        }
        void rule() throws IOException {
            ensure(24);
            y -= 8;
            stream.moveTo(MARGIN, y);
            stream.lineTo(PDRectangle.A4.getWidth() - MARGIN, y);
            stream.stroke();
            y -= 16;
        }
        void close() throws IOException {
            footer();
            stream.close();
        }

        private void footer() throws IOException {
            int total = document.getNumberOfPages();
            for (int index = 1; index <= total; index++) {
                PDPage current = document.getPage(index - 1);
                try (PDPageContentStream footer = new PDPageContentStream(document, current,
                        PDPageContentStream.AppendMode.APPEND, true, true)) {
                    String page = index + " of " + total;
                    float width = bold.getStringWidth(page) / 1000 * 8;
                    footer.setFont(bold, 8);
                    footer.beginText();
                    footer.newLineAtOffset(MARGIN, 30);
                    footer.showText(sanitize("HealthAlst · Confidential medical record"));
                    footer.endText();
                    footer.beginText();
                    footer.newLineAtOffset(PDRectangle.A4.getWidth() - MARGIN - width, 30);
                    footer.showText(page);
                    footer.endText();
                }
            }
        }

        private void lines(String text, PDType1Font font, float size, float leading) throws IOException {
            for (String line : wrap(value(text, ""), font, size)) {
                ensure(leading + 4);
                stream.beginText();
                stream.setFont(font, size);
                stream.newLineAtOffset(MARGIN, y);
                stream.showText(sanitize(line));
                stream.endText();
                y -= leading;
            }
        }

        private List<String> wrap(String text, PDType1Font font, float size) throws IOException {
            List<String> result = new ArrayList<>();
            StringBuilder line = new StringBuilder();
            for (String word : text.replace('\n', ' ').split("\\s+")) {
                String candidate = line.isEmpty() ? word : line + " " + word;
                if (font.getStringWidth(sanitize(candidate)) / 1000 * size > WIDTH && !line.isEmpty()) {
                    result.add(line.toString());
                    line = new StringBuilder(word);
                } else {
                    line = new StringBuilder(candidate);
                }
            }
            if (!line.isEmpty()) result.add(line.toString());
            if (result.isEmpty()) result.add("");
            return result;
        }

        private void ensure(float space) throws IOException { if (y - space < MARGIN) nextPage(); }
        private void nextPage() throws IOException {
            if (stream != null) stream.close();
            page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            stream = new PDPageContentStream(document, page);
            stream.setStrokingColor(198f / 255f, 204f / 255f, 214f / 255f);
            y = PDRectangle.A4.getHeight() - MARGIN;
        }
        private String sanitize(String value) { return value.replaceAll("[^\\x20-\\x7E]", " "); }
    }
}
