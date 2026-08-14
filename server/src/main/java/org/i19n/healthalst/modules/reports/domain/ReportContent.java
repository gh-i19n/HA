package org.i19n.healthalst.modules.reports.domain;

/** Carries only the authorized file payload needed by the content HTTP adapter. */
public record ReportContent(String fileName, String contentType, byte[] bytes) {}
