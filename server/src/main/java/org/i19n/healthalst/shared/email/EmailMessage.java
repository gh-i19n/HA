package org.i19n.healthalst.shared.email;

/** Outbound email message contract shared by every delivery gateway. */
public record EmailMessage(
        String to,
        String subject,
        String html
) {}
