package org.i19n.healthalst.modules.platform.infrastructure;

import org.i19n.healthalst.modules.platform.application.PlatformUnavailableException;
import org.i19n.healthalst.modules.platform.application.port.DatabaseProbePort;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class JdbcDatabaseProbeAdapter implements DatabaseProbePort {

    private final JdbcTemplate jdbcTemplate;

    public JdbcDatabaseProbeAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean isAvailable() {
        try {
            Integer result = jdbcTemplate.queryForObject("select 1", Integer.class);
            return Integer.valueOf(1).equals(result);
        } catch (DataAccessException exception) {
            throw new PlatformUnavailableException("Database probe failed", exception);
        }
    }
}

