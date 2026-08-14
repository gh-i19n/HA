package org.i19n.healthalst.modules.reports.application;

import java.util.UUID;

/** Transport-independent command produced by the multipart HTTP adapter. */
public record UploadReportCommand(
        UUID bookingId,
        String fileName,
        String contentType,
        byte[] content
) {}
