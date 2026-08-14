package org.i19n.healthalst.modules.reports.application;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.i19n.healthalst.modules.access.application.AuthenticatedUser;
import org.i19n.healthalst.modules.access.application.PatientCredentialService;
import org.i19n.healthalst.modules.access.application.port.UserAccountPort;
import org.i19n.healthalst.modules.access.domain.model.User;
import org.i19n.healthalst.modules.reports.application.port.BookingPort;
import org.i19n.healthalst.modules.reports.application.port.ReportPort;
import org.i19n.healthalst.modules.reports.domain.ReportContent;
import org.i19n.healthalst.modules.reports.domain.ReportListItem;
import org.i19n.healthalst.modules.reports.domain.ReportStatus;
import org.i19n.healthalst.modules.reports.domain.StructuredReportInput;
import org.i19n.healthalst.modules.reports.domain.model.Booking;
import org.i19n.healthalst.modules.reports.domain.model.Report;
import org.i19n.healthalst.modules.reports.application.rendering.ReportDocument;
import org.i19n.healthalst.modules.reports.application.rendering.ReportDocumentRenderer;
import org.i19n.healthalst.modules.reports.interfaces.dto.ReportPreviewResponse;
import org.i19n.healthalst.modules.reports.interfaces.dto.ReportResponse;
import org.i19n.healthalst.modules.notifications.application.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Coordinates report upload, publication, pagination, and patient-scoped content access. */
@Service
public class ReportService {

    private static final int MAX_PAGE_SIZE = 50;
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    private final BookingPort bookingPort;
    private final ReportPort reportPort;
    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;
    private final ReportAvailableEmailService reportAvailableEmailService;
    private final UserAccountPort userAccountPort;
    private final PatientCredentialService patientCredentialService;
    private final Map<String, ReportDocumentRenderer> renderers;
    private final Clock clock = Clock.systemUTC();

    public ReportService(
            BookingPort bookingPort,
            ReportPort reportPort,
            ObjectMapper objectMapper,
            NotificationService notificationService,
            ReportAvailableEmailService reportAvailableEmailService,
            UserAccountPort userAccountPort,
            PatientCredentialService patientCredentialService,
            List<ReportDocumentRenderer> renderers
    ) {
        this.bookingPort = bookingPort;
        this.reportPort = reportPort;
        this.objectMapper = objectMapper;
        this.notificationService = notificationService;
        this.reportAvailableEmailService = reportAvailableEmailService;
        this.userAccountPort = userAccountPort;
        this.patientCredentialService = patientCredentialService;
        this.renderers = renderers.stream().collect(Collectors.toUnmodifiableMap(
                ReportDocumentRenderer::format, Function.identity()));
    }

    /** Returns a bounded staff list without loading report bytes into each row. */
    @Transactional(readOnly = true)
    public Page<ReportListItem> listStaffReports(AuthenticatedUser user, int page, int size) {
        requireStaff(user);
        return reportPort.findStaffPage(user.organizationId(), pageable(page, size));
    }

    /** Returns only available reports owned by the authenticated patient, optionally by laboratory. */
    @Transactional(readOnly = true)
    public Page<ReportListItem> listPatientReports(AuthenticatedUser user, UUID organizationId, int page, int size) {
        requirePatient(user);
        return reportPort.findPatientPage(user.id(), organizationId, pageable(page, size));
    }

    /** Returns the bounded booking set used by the staff upload selector. */
    @Transactional(readOnly = true)
    public List<Booking> listBookings(AuthenticatedUser user) {
        requireStaff(user);
        return bookingPort.findRecentBookings(user.organizationId());
    }

    /** Validates and persists a new pending report against an existing booking. */
    @Transactional
    public ReportResponse upload(AuthenticatedUser user, UploadReportCommand command) {
        requireStaff(user);
        validateUpload(command);

        Booking booking = bookingPort.findByIdAndOrganizationId(command.bookingId(), user.organizationId())
                .orElseThrow(() -> new ReportNotFoundException("The selected booking was not found."));

        Report report = new Report();
        report.setBooking(booking);
        report.setFileName(command.fileName().trim());
        report.setContentType(command.contentType());
        report.setFileSize(command.content().length);
        report.setContent(command.content());
        report.setStatus(ReportStatus.PENDING);
        report.setUploadedAt(Instant.now(clock));
        report = reportPort.save(report);
        notificationService.createReportUpdate(
                user.organizationId(), user.id(), "REPORT_UPLOADED", "Report uploaded",
                "The report is ready for review before publication.", "REPORT", report.getId());
        return ReportResponse.from(report);
    }

    /** Creates a pending canonical report and its first PDF rendition from a reusable template. */
    @Transactional
    public ReportResponse createStructured(AuthenticatedUser user, CreateStructuredReportCommand command) {
        requireStaff(user);
        validateStructured(command);
        Booking booking = bookingPort.findByIdAndOrganizationId(command.bookingId(), user.organizationId())
                .orElseThrow(() -> new ReportNotFoundException("The selected booking was not found."));
        ReportDocument document = document(booking, command.template(), command.content());
        byte[] pdf = renderer("pdf").render(document);
        Report report = new Report();
        report.setBooking(booking);
        report.setTemplate(command.template());
        report.setTemplateVersion(1);
        report.setStructuredContent(writeContent(command.content()));
        report.setFileName(command.template().name().toLowerCase(java.util.Locale.ROOT) + "-" + booking.getId() + ".pdf");
        report.setContentType("application/pdf");
        report.setContent(pdf);
        report.setFileSize(pdf.length);
        report.setStatus(ReportStatus.PENDING);
        report.setUploadedAt(Instant.now(clock));
        report = reportPort.save(report);
        notificationService.createReportUpdate(
                user.organizationId(), user.id(), "REPORT_CREATED", "Structured report created",
                "Review the report preview before making it available to the patient.", "REPORT", report.getId());
        return ReportResponse.from(report);
    }

    /** Publishes a pending report so it enters the patient results list. */
    @Transactional
    public ReportResponse publish(AuthenticatedUser user, UUID reportId) {
        requireStaff(user);
        Report report = reportPort.findByIdAndOrganizationId(reportId, user.organizationId())
                .orElseThrow(() -> new ReportNotFoundException("The report was not found."));
        if (report.getStatus() == ReportStatus.AVAILABLE) {
            return ReportResponse.from(report);
        }
        report.setStatus(ReportStatus.AVAILABLE);
        report = reportPort.save(report);
        notificationService.createReportUpdate(
                null,
                report.getBooking().getPatientUserId(),
                "REPORT_AVAILABLE",
                "Your imaging result is ready",
                "A new report is available to preview or download.",
                "REPORT",
                report.getId()
        );
        User patient = userAccountPort.findById(report.getBooking().getPatientUserId()).orElse(null);
        String password = patient == null ? null : patientCredentialService.issuePasswordIfNeverSignedIn(patient);
        reportAvailableEmailService.sendReportAvailable(report, password);
        return ReportResponse.from(report);
    }

    /** Loads report bytes only after the repository has applied patient ownership and availability. */
    @Transactional(readOnly = true)
    public ReportContent getPatientContent(AuthenticatedUser user, UUID reportId) {
        requirePatient(user);
        Report report = reportPort.findAvailableByIdAndPatient(reportId, user.id())
                .orElseThrow(() -> new ReportNotFoundException("The report was not found."));
        return preview(report);
    }

    /** Allows authorized clinic staff to preview pending or available report content. */
    @Transactional(readOnly = true)
    public ReportContent getStaffContent(AuthenticatedUser user, UUID reportId) {
        requireStaff(user);
        Report report = reportPort.findByIdAndOrganizationId(reportId, user.organizationId())
                .orElseThrow(() -> new ReportNotFoundException("The report was not found."));
        return preview(report);
    }

    /** Returns the structured preview document for a patient-owned available report. */
    @Transactional(readOnly = true)
    public ReportPreviewResponse getPatientPreviewContent(AuthenticatedUser user, UUID reportId) {
        requirePatient(user);
        Report report = reportPort.findAvailableByIdAndPatient(reportId, user.id())
                .orElseThrow(() -> new ReportNotFoundException("The report was not found."));
        return previewContent(report);
    }

    /** Returns the structured preview document for an organization-scoped staff report. */
    @Transactional(readOnly = true)
    public ReportPreviewResponse getStaffPreviewContent(AuthenticatedUser user, UUID reportId) {
        requireStaff(user);
        Report report = reportPort.findByIdAndOrganizationId(reportId, user.organizationId())
                .orElseThrow(() -> new ReportNotFoundException("The report was not found."));
        return previewContent(report);
    }

    /**
     * Builds the renderer-free preview payload: structured reports expose their
     * canonical sections while unstructured uploads fall back to extracted text.
     */
    private ReportPreviewResponse previewContent(Report report) {
        Booking booking = report.getBooking();
        String clinicName = booking.getOrganization().getName();
        String clinicAddress = booking.getOrganization() == null ? null : booking.getOrganization().getAddress();
        LocalDate reportDate = report.getUploadedAt() == null
                ? null
                : report.getUploadedAt().atZone(ZoneOffset.UTC).toLocalDate();
        List<ReportPreviewResponse.Fact> facts = List.of(
                new ReportPreviewResponse.Fact("Patient", booking.getPatientName()),
                new ReportPreviewResponse.Fact("Booking reference", booking.getId().toString()),
                new ReportPreviewResponse.Fact("Examination",
                        report.getTemplate() == null ? booking.getExamType() : report.getTemplate().examination()),
                new ReportPreviewResponse.Fact("Examination date",
                        booking.getBookingDate() == null ? null : booking.getBookingDate().toString()),
                new ReportPreviewResponse.Fact("Report date", reportDate == null ? null : reportDate.toString()));
        if (report.getTemplate() == null) {
            return new ReportPreviewResponse(
                    clinicName, clinicAddress, facts,
                    List.of(), extractedText(report.getContent()),
                    report.getStatus().name());
        }
        StructuredReportInput content = readContent(report.getStructuredContent());
        facts = new java.util.ArrayList<>(facts);
        facts.add(new ReportPreviewResponse.Fact("Reported by", content.reportingProfessional()));
        facts.add(new ReportPreviewResponse.Fact("Professional title", content.professionalTitle()));
        return new ReportPreviewResponse(
                clinicName, clinicAddress, facts,
                List.of(
                        new ReportPreviewResponse.Section("Clinical indication", content.clinicalIndication()),
                        new ReportPreviewResponse.Section("Technique", content.technique()),
                        new ReportPreviewResponse.Section("Comparison", content.comparison()),
                        new ReportPreviewResponse.Section("Findings", content.findings()),
                        new ReportPreviewResponse.Section("Impression", content.impression())),
                null,
                report.getStatus().name());
    }

    /** Pulls readable paragraphs out of an uploaded PDF for the preview document. */
    private String extractedText(byte[] pdf) {
        try (PDDocument document = Loader.loadPDF(pdf)) {
            return new PDFTextStripper().getText(document);
        } catch (IOException exception) {
            throw new ReportValidationException("The report text could not be extracted for preview.");
        }
    }

    /**
     * Structured reports are previewed from their canonical content so the rendered
     * document always matches the current template definition; unstructured uploads
     * keep returning their original stored content.
     */
    private ReportContent preview(Report report) {
        if (report.getTemplate() == null) {
            return new ReportContent(report.getFileName(), report.getContentType(), report.getContent());
        }
        byte[] bytes = renderer("pdf").render(document(report));
        return new ReportContent(report.getFileName(), "application/pdf", bytes);
    }

    /** Renders an authorized canonical report in the requested format. */
    @Transactional(readOnly = true)
    public ReportContent exportPatientReport(AuthenticatedUser user, UUID reportId, String format) {
        requirePatient(user);
        Report report = reportPort.findAvailableByIdAndPatient(reportId, user.id())
                .orElseThrow(() -> new ReportNotFoundException("The report was not found."));
        return export(report, format);
    }

    /** Renders a tenant-scoped canonical report for authorized clinic staff. */
    @Transactional(readOnly = true)
    public ReportContent exportStaffReport(AuthenticatedUser user, UUID reportId, String format) {
        requireStaff(user);
        Report report = reportPort.findByIdAndOrganizationId(reportId, user.organizationId())
                .orElseThrow(() -> new ReportNotFoundException("The report was not found."));
        return export(report, format);
    }

    private ReportContent export(Report report, String format) {
        String normalized = format == null ? "pdf" : format.toLowerCase(java.util.Locale.ROOT);
        if ("pdf".equals(normalized) && report.getTemplate() == null) {
            return new ReportContent(report.getFileName(), report.getContentType(), report.getContent());
        }
        if (report.getTemplate() == null) {
            throw new ReportValidationException("DOCX export is available for structured reports.");
        }
        ReportDocumentRenderer renderer = renderer(normalized);
        byte[] bytes = renderer.render(document(report));
        String base = report.getFileName().replaceFirst("\\.[^.]+$", "");
        return new ReportContent(base + "." + renderer.extension(), renderer.contentType(), bytes);
    }

    private ReportDocument document(Report report) {
        LocalDate reportDate = report.getUploadedAt() == null
                ? null
                : report.getUploadedAt().atZone(ZoneOffset.UTC).toLocalDate();
        return document(report.getBooking(), report.getTemplate(), readContent(report.getStructuredContent()), reportDate);
    }

    private ReportDocument document(Booking booking, org.i19n.healthalst.modules.reports.domain.ReportTemplate template, StructuredReportInput content) {
        return document(booking, template, content, null);
    }

    private ReportDocument document(Booking booking, org.i19n.healthalst.modules.reports.domain.ReportTemplate template, StructuredReportInput content, LocalDate reportDate) {
        String clinicName = booking.getOrganization().getName();
        String clinicAddress = booking.getOrganization().getAddress();
        return new ReportDocument(
                clinicName, clinicAddress, booking.getPatientName(), booking.getId().toString(),
                booking.getBookingDate(), reportDate, template, content);
    }

    private ReportDocumentRenderer renderer(String format) {
        ReportDocumentRenderer renderer = renderers.get(format);
        if (renderer == null) {
            throw new ReportValidationException("Choose PDF or DOCX format.");
        }
        return renderer;
    }

    private void validateStructured(CreateStructuredReportCommand command) {
        if (command == null || command.bookingId() == null || command.template() == null || command.content() == null) {
            throw new ReportValidationException("A booking, template, and report content are required.");
        }
        if (blank(command.content().findings()) || blank(command.content().impression())
                || blank(command.content().reportingProfessional())) {
            throw new ReportValidationException("Findings, impression, and reporting professional are required.");
        }
    }

    private boolean blank(String value) { return value == null || value.isBlank(); }

    private String writeContent(StructuredReportInput content) {
        try { return objectMapper.writeValueAsString(content); }
        catch (JsonProcessingException exception) { throw new ReportValidationException("The structured report could not be saved."); }
    }

    private StructuredReportInput readContent(String content) {
        try { return objectMapper.readValue(content, StructuredReportInput.class); }
        catch (JsonProcessingException exception) { throw new ReportValidationException("The structured report could not be rendered."); }
    }

    /** Validates role-independent paging and keeps list queries bounded. */
    private Pageable pageable(int page, int size) {
        if (page < 0 || size < 1 || size > MAX_PAGE_SIZE) {
            throw new ReportValidationException("Page must be non-negative and size must be between 1 and 50.");
        }
        return PageRequest.of(page, size,
                Sort.sort(Report.class).by(Report::getUploadedAt).descending()
                        .and(Sort.sort(Report.class).by(Report::getId).descending()));
    }

    /** Validates the MVP file contract before persistence. */
    private void validateUpload(UploadReportCommand command) {
        if (command == null || command.bookingId() == null || command.content() == null || command.content().length == 0) {
            throw new ReportValidationException("A booking and report file are required.");
        }
        if (command.content().length > MAX_FILE_SIZE) {
            throw new ReportValidationException("Report files must be 10 MB or smaller.");
        }
        if (command.fileName() == null || command.fileName().isBlank() || command.fileName().contains("..")) {
            throw new ReportValidationException("The report file name is invalid.");
        }
        if (!"application/pdf".equalsIgnoreCase(command.contentType())) {
            throw new ReportValidationException("Reports must be uploaded as PDF files.");
        }
    }

    /** Enforces the staff boundary inside the owning use-case service. */
    private void requireStaff(AuthenticatedUser user) {
        if (user == null || !user.canManageReports()) {
            throw new ReportAuthorizationException("Staff access is required.");
        }
    }

    /** Enforces the patient boundary inside the owning use-case service. */
    private void requirePatient(AuthenticatedUser user) {
        if (user == null || !user.isPatient()) {
            throw new ReportAuthorizationException("Patient access is required.");
        }
    }
}
