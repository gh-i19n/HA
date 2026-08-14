package org.i19n.healthalst.modules.access.infrastructure;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.i19n.healthalst.modules.access.application.port.OrganizationDirectoryPort;
import org.i19n.healthalst.modules.access.infrastructure.repository.OrganizationRepository;
import org.springframework.stereotype.Component;

/** JPA-backed laboratory directory for the public booking surface. */
@Component
@RequiredArgsConstructor
public class OrganizationDirectoryAdapter implements OrganizationDirectoryPort {

    private final OrganizationRepository organizationRepository;

    @Override
    public List<LaboratoryDirectoryEntry> listRegistered() {
        return organizationRepository.findAll().stream()
                .map(organization -> new LaboratoryDirectoryEntry(
                        organization.getId(),
                        organization.getName(),
                        organization.getLocation(),
                        organization.getAddress()))
                .toList();
    }
}
