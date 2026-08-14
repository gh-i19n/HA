package org.i19n.healthalst.modules.access.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.i19n.healthalst.shared.BaseEntity;

/** A laboratory tenant registered on the platform. */
@Entity
@Table(name = "organizations")
@Getter
@Setter
@NoArgsConstructor
public class Organization extends BaseEntity {

    @Column(nullable = false, length = 180)
    private String name;

    @Column(nullable = false, unique = true, length = 180)
    private String slug;

    @Column(length = 255)
    private String email;

    @Column(length = 40)
    private String phone;

    @Column(length = 180)
    private String location;

    @Column(length = 500)
    private String address;
}
