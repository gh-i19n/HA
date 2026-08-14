package org.i19n.healthalst.modules.access.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.i19n.healthalst.shared.BaseEntity;

/** Persists the account-level notification choices shown in settings. */
@Entity
@Table(name = "user_notification_preferences")
@Getter
@Setter
@NoArgsConstructor
public class UserNotificationPreference extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "report_updates", nullable = false)
    private boolean reportUpdates = true;

    @Column(name = "membership_updates", nullable = false)
    private boolean membershipUpdates = true;

    @Column(name = "email_updates", nullable = false)
    private boolean emailUpdates;
}
