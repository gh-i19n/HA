package org.i19n.healthalst.modules.reports.interfaces.dto;

import java.util.List;
import org.i19n.healthalst.modules.reports.domain.ReportListItem;
import org.springframework.data.domain.Page;

/** Paginated transport wrapper that keeps the frontend independent of Spring Data types. */
public record PageResponse<T>(List<T> items, int page, int size, long totalElements, int totalPages) {

    /** Maps the domain read model into the stable HTTP page contract. */
    public static PageResponse<ReportResponse> from(Page<ReportListItem> page) {
        return new PageResponse<>(
                page.getContent().stream().map(ReportResponse::from).toList(),
                page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages()
        );
    }
}
