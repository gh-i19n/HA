package org.i19n.healthalst.shared.error;

import java.net.URI;
import org.i19n.healthalst.modules.access.application.AccessValidationException;
import org.i19n.healthalst.modules.access.application.AuthenticationException;
import org.i19n.healthalst.modules.platform.application.PlatformUnavailableException;
import org.i19n.healthalst.modules.reports.application.ReportAuthorizationException;
import org.i19n.healthalst.modules.reports.application.ReportNotFoundException;
import org.i19n.healthalst.modules.reports.application.ReportValidationException;
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

    /** Converts invalid identity, membership, or settings input into a stable bad-request response. */
    @ExceptionHandler(AccessValidationException.class)
    ProblemDetail handleAccessValidation(AccessValidationException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, exception.getMessage());
        problem.setTitle("Invalid request");
        problem.setType(URI.create("https://healthalst.local/problems/invalid-request"));
        return problem;
    }

    /** Converts invalid credentials into a stable problem response. */
    @ExceptionHandler(AuthenticationException.class)
    ProblemDetail handleAuthentication(AuthenticationException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, exception.getMessage());
        problem.setTitle("Authentication required");
        problem.setType(URI.create("https://healthalst.local/problems/authentication-required"));
        return problem;
    }

    /** Converts role failures into a stable forbidden response. */
    @ExceptionHandler(ReportAuthorizationException.class)
    ProblemDetail handleReportAuthorization(ReportAuthorizationException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, exception.getMessage());
        problem.setTitle("Access denied");
        problem.setType(URI.create("https://healthalst.local/problems/access-denied"));
        return problem;
    }

    /** Converts hidden and missing resources into one neutral response. */
    @ExceptionHandler(ReportNotFoundException.class)
    ProblemDetail handleReportNotFound(ReportNotFoundException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
        problem.setTitle("Report not found");
        problem.setType(URI.create("https://healthalst.local/problems/report-not-found"));
        return problem;
    }

    /** Converts invalid upload and pagination requests into a stable bad-request response. */
    @ExceptionHandler(ReportValidationException.class)
    ProblemDetail handleReportValidation(ReportValidationException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, exception.getMessage());
        problem.setTitle("Invalid report request");
        problem.setType(URI.create("https://healthalst.local/problems/invalid-report-request"));
        return problem;
    }
}
