package org.i19n.healthalst.shared.infrastructure.email;

import org.i19n.healthalst.shared.HealthAlstProperties;
import org.i19n.healthalst.shared.email.EmailDeliveryPort;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(HealthAlstProperties.class)
public class EmailDeliveryConfiguration {

    @Bean
    @ConditionalOnProperty(name = "healthalst.email.provider", havingValue = "resend")
    public EmailDeliveryPort resendEmailGateway(HealthAlstProperties properties) {
        HealthAlstProperties.Email.Resend resend = properties.email().resend();
        return new ResendEmailGateway(resend.apiKey(), resend.baseUrl(), properties.email().from());
    }

    @Bean
    @ConditionalOnMissingBean(EmailDeliveryPort.class)
    public EmailDeliveryPort noopEmailDeliveryGateway() {
        return new NoopEmailDeliveryGateway();
    }
}