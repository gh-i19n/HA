package org.i19n.healthalst.modules.reports.infrastructure;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Supplies the Jackson 2 mapper used for persisted canonical report JSON. */
@Configuration
public class ReportSerializationConfiguration {
    @Bean
    ObjectMapper reportObjectMapper() {
        return new ObjectMapper().findAndRegisterModules();
    }
}
