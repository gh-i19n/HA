package org.i19n.healthalst.shared.email;

/** Eventorch-derived HTML template tailored to HealthAlst's calm clinical branding. */
public final class HealthAlstEmailTemplateRenderer {

    private HealthAlstEmailTemplateRenderer() {}

    public static String render(
        String title,
        String greetingName,
        String bodyHtml,
        String buttonLabel,
        String buttonUrl,
        String footerNote
    ) {
        return "<!doctype html><html><body style=\"margin:0;background:#f3f6f6;"
            + "font-family:Arial,sans-serif;color:#111827\"><table width=\"100%\"><tr><td "
            + "align=\"center\" style=\"padding:48px 20px\"><table width=\"600\" style=\""
            + "max-width:600px;width:100%;background:#fff;border-radius:14px\"><tr><td "
            + "style=\"padding:40px\"><div style=\"font-size:11px;font-weight:700;"
            + "letter-spacing:.16em;text-transform:uppercase;color:#0f766e\">HEALTHALST</div>"
            + "<h1 style=\"font-family:Georgia,serif;font-size:28px;margin:22px 0 18px;"
            + "color:#0f2747;line-height:1.25\">" + esc(title) + "</h1>"
            + "<p style=\"font-size:14px;line-height:1.7;color:#4b5563;margin:0 0 18px\">Hi "
            + esc(greetingName) + ",</p>"
            + "<div style=\"font-size:14px;line-height:1.8;color:#4b5563;margin:0 0 32px\">"
            + bodyHtml + "</div>"
            + "<p style=\"text-align:center;margin:32px 0\">"
            + "<a href=\"" + esc(buttonUrl) + "\" style=\"display:inline-block;"
            + "background:#0f766e;color:#fff;text-decoration:none;padding:14px 28px;"
            + "border-radius:8px;font-weight:600\">" + esc(buttonLabel) + "</a></p>"
            + "<p style=\"font-size:12px;color:#9ca3af;margin:36px 0 0;line-height:1.7\">"
            + footerNote + "</p></td></tr></table></td></tr></table></body></html>";
    }

    public static String paragraph(String text) {
        return "<p style=\"margin:0 0 18px\">" + esc(text) + "</p>";
    }

    public static String paragraphHtml(String html) {
        return "<p style=\"margin:0 0 18px\">" + html + "</p>";
    }

    public static String strong(String text) {
        return "<strong>" + esc(text) + "</strong>";
    }

    public static String esc(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;");
    }
}
