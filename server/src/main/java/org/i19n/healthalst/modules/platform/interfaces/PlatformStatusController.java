package org.i19n.healthalst.modules.platform.interfaces;

import org.i19n.healthalst.modules.platform.application.PlatformStatusService;
import org.i19n.healthalst.modules.platform.interfaces.dto.PlatformStatusResponse;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/v1/platform", produces = MediaType.APPLICATION_JSON_VALUE)
public class PlatformStatusController {

    private final PlatformStatusService platformStatusService;

    public PlatformStatusController(PlatformStatusService platformStatusService) {
        this.platformStatusService = platformStatusService;
    }

    @GetMapping("/status")
    public PlatformStatusResponse getStatus() {
        return PlatformStatusResponse.from(platformStatusService.getStatus());
    }
}

