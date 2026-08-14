package org.i19n.healthalst.modules.reports.interfaces.dto;

import java.io.IOException;
import java.util.UUID;
import org.i19n.healthalst.modules.reports.application.ReportValidationException;
import org.i19n.healthalst.modules.reports.application.UploadReportCommand;
import org.springframework.web.multipart.MultipartFile;

/** Converts the multipart transport object into the application command boundary. */
public record UploadReportRequest(UUID bookingId, MultipartFile file) {

    /** Reads the multipart bytes once before delegating the actual use case. */
    public UploadReportCommand toCommand() {
        try {
            return new UploadReportCommand(
                    bookingId,
                    file == null ? null : file.getOriginalFilename(),
                    file == null ? null : file.getContentType(),
                    file == null ? null : file.getBytes()
            );
        } catch (IOException exception) {
            throw new ReportValidationException("The report file could not be read.");
        }
    }
}
