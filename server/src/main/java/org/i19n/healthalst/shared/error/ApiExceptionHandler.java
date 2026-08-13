package org.i19n.healthalst.shared.error;

import java.net.URI;
import org.i19n.healthalst.modules.platform.application.PlatformUnavailableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(PlatformUnavailableException.class)
    ProblemDetail handlePlatformUnavailable(PlatformUnavailableException exception) {
        LOGGER.error("A required platform dependency is unavailable", exception);

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.SERVICE_UNAVAILABLE,
                "A required platform dependency is unavailable. Try again shortly."
        );
        problem.setTitle("Service temporarily unavailable");
        problem.setType(URI.create("https://healthalst.local/problems/dependency-unavailable"));
        return problem;
    }
}

