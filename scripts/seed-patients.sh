#!/usr/bin/env bash
#
# Seeds N patient accounts (with random profiles and 1-3 bookings each) into
# the laboratory registered by a given owner email.
#
# Requirements:
#   1. The Postgres container is running (docker compose up -d).
#   2. The owner (default kinxly@gmail.com) has registered a laboratory through
#      the app, so the script can resolve the laboratory id from the OWNER
#      membership. Run this AFTER registering the laboratory.
#
# Usage:
#   scripts/seed-patients.sh [--count 500] [--owner kinxly@gmail.com] [--password kinxly-patient]
#
# Notes:
#   - Seeded patient emails are patient.<index>.<random>@kinxlymail.local.
#   - Every seeded patient shares one password so demo logins are predictable.
#   - The script is idempotent: existing patients are never duplicated, and
#     bookings without reports are re-randomized on every run.
#   - Only data belonging to the owner's laboratory is touched.

set -euo pipefail

OWNER_EMAIL="${OWNER_EMAIL:-kinxly@gmail.com}"
PATIENT_COUNT="${PATIENT_COUNT:-500}"
PATIENT_PASSWORD="${PATIENT_PASSWORD:-kinxly-patient}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-healthalst-postgres-1}"
DB_USER="${DB_USER:-healthalst}"
DB_NAME="${DB_NAME:-healthalst}"
PATIENT_EMAIL_DOMAIN="kinxlymail.local"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --count) PATIENT_COUNT="$2"; shift 2 ;;
    --owner) OWNER_EMAIL="$2"; shift 2 ;;
    --password) PATIENT_PASSWORD="$2"; shift 2 ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
done

# Precomputed BCrypt hash of "kinxly-patient" (cost 10). Regenerated below when
# bcryptjs is available so a custom --password still hashes correctly.
PASSWORD_HASH='$2b$10$wD78pKEiGBuYziDsXIFYfutrV2rEh4mtb9ugrWUvB.pkD9WZuQwA6'

if command -v node >/dev/null 2>&1 && [[ -d /tmp/opencode/node_modules/bcryptjs ]]; then
  PASSWORD_HASH="$(node -e "const b = require('/tmp/opencode/node_modules/bcryptjs'); console.log(b.hashSync(process.argv[1], 10))" "$PATIENT_PASSWORD")"
  echo "Password hash generated with bcryptjs for \"$PATIENT_PASSWORD\"."
else
  echo "bcryptjs not found; using the precomputed hash of \"kinxly-patient\". Use --password only when bcryptjs is available." >&2
fi

psql() { docker exec -i "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 "$@"; }

echo "Resolving the laboratory owned by $OWNER_EMAIL ..."
ORG_ROW="$(psql -At -c "
  SELECT o.id || '|' || o.name
  FROM organizations o
  JOIN organization_memberships m ON m.organization_id = o.id
  JOIN users u ON u.id = m.user_id
  WHERE lower(u.email) = lower('$OWNER_EMAIL') AND m.role = 'OWNER'
  LIMIT 1;
")"

if [[ -z "$ORG_ROW" ]]; then
  echo "ERROR: no laboratory owned by $OWNER_EMAIL was found." >&2
  echo "Register the laboratory through the app (Sign in as $OWNER_EMAIL -> Register a laboratory), then re-run this script." >&2
  exit 1
fi

ORG_ID="${ORG_ROW%%|*}"
ORG_NAME="${ORG_ROW#*|}"
echo "Laboratory found: $ORG_NAME ($ORG_ID)"

echo "Seeding $PATIENT_COUNT patients into $ORG_NAME ..."
psql -v org_id="$ORG_ID" -v org_name="$ORG_NAME" -v count="$PATIENT_COUNT" -v password_hash="$PASSWORD_HASH" -v domain="$PATIENT_EMAIL_DOMAIN" <<'SQL'
BEGIN;

-- 1) Patients: random Nigerian names, unique emails, shared demo password.
INSERT INTO users (
    id, email, display_name, role, password_hash, created_at, updated_at,
    account_status, phone, last_login_at
)
SELECT
    gen_random_uuid(),
    'patient.' || lpad(i::text, 5, '0') || '.' || substr(md5(i::text), 1, 6)
        || '@' || :'domain',
    (ARRAY['Amina','Kelechi','Chinedu','Ngozi','Tunde','Fatima','Emeka','Yemi',
           'Adaeze','Ibrahim','Blessing','Obinna','Halima','Segun','Chiamaka',
           'Musa','Efe','Nnenna','Kola','Zainab','Uche','Tola','Ifeoma','Dapo'])[1 + floor(random() * 24)::int]
        || ' ' ||
    (ARRAY['Okafor','Adeyemi','Nwosu','Balogun','Okonkwo','Eze','Abubakar','Olawale',
           'Onwuka','Sanni','Ugwu','Adeleke','Ibrahim','Chukwu','Bello','Nwachukwu',
           'Akinyemi','Ojo','Mensah','Lawal','Obi','Oyekanmi','Ekwueme','Ajayi'])[1 + floor(random() * 24)::int],
    'PATIENT',
    :'password_hash',
    now() - make_interval(days => floor(random() * 365)::int),
    now(),
    'ACTIVE',
    '+234 80' || lpad(floor(random() * 100000000)::int::text, 8, '0'),
    NULL
FROM generate_series(1, :count) AS i
ON CONFLICT (email) DO NOTHING;

-- 2) Bookings: drop any previous seeded bookings that have no reports so this
--    run re-randomizes them, then give every patient 1-3 fresh bookings.
WITH seeded AS (
    SELECT id, display_name
    FROM users
    WHERE role = 'PATIENT' AND email LIKE '%@' || :'domain'
)
DELETE FROM bookings b
USING seeded s
WHERE b.organization_id = :'org_id'
  AND b.patient_user_id = s.id
  AND NOT EXISTS (SELECT 1 FROM reports r WHERE r.booking_id = b.id);

WITH seeded AS (
    SELECT id, display_name
    FROM users
    WHERE role = 'PATIENT' AND email LIKE '%@' || :'domain'
),
rows AS (
    SELECT s.id, s.display_name, g.n
    FROM seeded s
    CROSS JOIN LATERAL (SELECT (1 + floor(random() * 3))::int AS n) picks
    CROSS JOIN LATERAL generate_series(1, picks.n) AS g(n)
),
booking_data AS (
    SELECT
        id, display_name,
        (ARRAY['Chest X-ray', 'Abdominal ultrasound', 'MRI Brain'])[1 + floor(random() * 3)::int] AS exam_type,
        CURRENT_DATE - make_interval(days => floor(random() * 180)::int) AS booking_date,
        CASE
            WHEN random() < 0.60 THEN 'COMPLETED'
            WHEN random() < 0.80 THEN 'APPROVED'
            WHEN random() < 0.95 THEN 'REQUESTED'
            ELSE 'REJECTED'
        END AS booking_status
    FROM rows
)
INSERT INTO bookings (
    id, patient_user_id, patient_name, exam_type, booking_date, booking_status,
    created_at, updated_at, organization_id, scheduled_time
)
SELECT
    gen_random_uuid(),
    id,
    display_name,
    exam_type,
    booking_date,
    booking_status,
    booking_date::timestamp - interval '7 days' + make_interval(mins => floor(random() * 10080)::int),
    now(),
    :'org_id',
    CASE WHEN booking_status IN ('APPROVED', 'COMPLETED')
         THEN booking_date::timestamp + make_interval(hours => 8 + floor(random() * 9)::int, mins => floor(random() * 60)::int)
         ELSE NULL
    END
FROM booking_data;

COMMIT;
SQL

echo "Verification for $ORG_NAME:"
psql -At -c "SELECT 'patients : ' || count(*) FROM users WHERE role = 'PATIENT' AND email LIKE '%@$PATIENT_EMAIL_DOMAIN%';"
psql -At -c "SELECT 'bookings : ' || count(*) FROM bookings WHERE organization_id = '$ORG_ID';"
psql -At -c "SELECT 'pending  : ' || count(*) FROM bookings WHERE organization_id = '$ORG_ID' AND booking_status = 'REQUESTED';"

echo "Done. Seeded patients sign in with patient.<index>.<random>@kinxlymail.local"
echo "and the shared password \"$PATIENT_PASSWORD\"."
