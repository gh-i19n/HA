package org.i19n.healthalst.modules.reports.domain;

/** Clinically neutral structured document schemas available to reporting staff. */
public enum ReportTemplate {
    CHEST_XRAY("Chest X-ray report", "Chest radiograph"),
    MRI_BRAIN("MRI brain report", "Magnetic resonance imaging of the brain");

    private final String title;
    private final String examination;

    ReportTemplate(String title, String examination) {
        this.title = title;
        this.examination = examination;
    }

    public String title() { return title; }
    public String examination() { return examination; }
}
