package org.i19n.healthalst.modules.access.application.port;

import java.util.List;
import java.util.UUID;

/** Application-facing contract for the public laboratory directory. */
public interface OrganizationDirectoryPort {

    /** Returns every registered laboratory with its public booking information. */
    List<LaboratoryDirectoryEntry> listRegistered();

    record LaboratoryDirectoryEntry(UUID id, String name, String location, String address) {}
}
