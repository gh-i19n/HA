package org.i19n.healthalst.shared;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Typed platform configuration shared by all modules. */
@ConfigurationProperties("healthalst")
public record HealthAlstProperties(String appUrl, Email email) {

    public HealthAlstProperties {
        if (appUrl == null || appUrl.isBlank()) {
            appUrl = "http://localhost:3003";
        }
        if (email == null) {
            email = new Email(null, null, null);
        }
    }

    public record Email(String provider, String from, Resend resend) {

        public Email {
            if (provider == null || provider.isBlank()) {
                provider = "noop";
            }
            if (from == null) {
                from = "";
            }
            if (resend == null) {
                resend = new Resend(null, null);
            }
        }

        public record Resend(String apiKey, String baseUrl) {

            public Resend {
                if (apiKey == null) {
                    apiKey = "";
                }
                if (baseUrl == null || baseUrl.isBlank()) {
                    baseUrl = "https://api.resend.com";
                }
            }
        }
    }
}
