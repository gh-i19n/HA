package org.i19n.healthalst.modules.reports.interfaces;

import java.nio.charset.StandardCharsets;
import org.i19n.healthalst.modules.reports.domain.ReportContent;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

/** Shared secure binary response builder for staff and patient preview/download routes. */
final class ReportContentResponse {
    private ReportContentResponse() {}

    static ResponseEntity<byte[]> inline(ReportContent content) {
        return build(content, ContentDisposition.inline());
    }

    static ResponseEntity<byte[]> attachment(ReportContent content) {
        return build(content, ContentDisposition.attachment());
    }

    private static ResponseEntity<byte[]> build(ReportContent content, ContentDisposition.Builder disposition) {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(content.contentType()))
                .cacheControl(CacheControl.noStore())
                .header("X-Content-Type-Options", "nosniff")
                .header("Content-Security-Policy", "default-src 'none'; frame-ancestors 'self'")
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        disposition.filename(content.fileName(), StandardCharsets.UTF_8).build().toString())
                .body(content.bytes());
    }
}
