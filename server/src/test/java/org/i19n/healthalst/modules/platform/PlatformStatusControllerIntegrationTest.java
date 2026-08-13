package org.i19n.healthalst.modules.platform;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class PlatformStatusControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void reportsApiAndDatabaseAvailability() throws Exception {
        mockMvc.perform(get("/api/v1/platform/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.service").value("healthAlst-api"))
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.databaseAvailable").value(true))
                .andExpect(jsonPath("$.observedAt").isString());
    }
}

