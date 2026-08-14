package org.i19n.healthalst.shared.infrastructure.email;

import lombok.extern.slf4j.Slf4j;
import org.i19n.healthalst.shared.email.EmailDeliveryException;
import org.i19n.healthalst.shared.email.EmailDeliveryPort;
import org.i19n.healthalst.shared.email.EmailMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

/** Resend REST gateway ported from Eventorch; no SMTP dependency is needed. */
@Slf4j
public class ResendEmailGateway implements EmailDeliveryPort {

    private final ObjectMapper objectMapper = JsonMapper.builder().build();
    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(5))
        .build();

    private final String apiKey;
    private final String baseUrl;
    private final String fromAddress;

    public ResendEmailGateway(String apiKey, String baseUrl, String fromAddress) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.fromAddress = fromAddress;
    }

    @Override
    public boolean available() {
        return apiKey != null && !apiKey.isBlank()
            && fromAddress != null && !fromAddress.isBlank();
    }

    @Override
    public void sendHtml(EmailMessage message) {
        validateConfiguration();
        validateMessage(message);
        try {
            SendEmailRequest request = new SendEmailRequest(
                fromAddress,
                List.of(message.to()),
                message.subject(),
                message.html()
            );
            String body = objectMapper.writeValueAsString(request);
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/emails"))
                .timeout(Duration.ofSeconds(30))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
            HttpResponse<String> response = httpClient.send(
                httpRequest,
                HttpResponse.BodyHandlers.ofString()
            );
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.warn("Resend email delivery failed status={} body={}",
                    response.statusCode(), abbreviate(response.body()));
                throw new EmailDeliveryException(
                    "Email provider rejected the message with status " + response.statusCode() + "."
                );
            }
            log.info("Email sent via Resend to {} with subject '{}'", message.to(), message.subject());
        } catch (IOException exception) {
            throw new EmailDeliveryException("Email provider request failed.", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new EmailDeliveryException("Email provider request was interrupted.", exception);
        }
    }

    private void validateMessage(EmailMessage message) {
        if (message == null
            || message.to() == null || message.to().isBlank()
            || message.subject() == null || message.subject().isBlank()
            || message.html() == null || message.html().isBlank()) {
            throw new EmailDeliveryException("Email message must include recipient, subject, and HTML body.");
        }
    }

    private String abbreviate(String value) {
        if (value == null) return "";
        return value.length() <= 500 ? value : value.substring(0, 500);
    }

    private record SendEmailRequest(
        String from,
        List<String> to,
        String subject,
        String html
    ) {}
}
