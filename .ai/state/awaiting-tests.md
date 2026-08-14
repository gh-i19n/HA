# Tests awaiting owner confirmation

The Eventorch delivery workflow defers new test authoring until the implementation is reviewed and the owner confirms the test scope.

Planned focused coverage:

- Spring report use cases: staff-only upload/publication, patient-only available results, ownership isolation, invalid PDF/size validation, and pagination.
- Spring authentication: login/session cookie, expired session rejection, logout, and protected endpoint access.
- HTTP contracts: multipart upload, stable problem responses, and patient content download headers.
- Next.js journeys: staff upload/publish flow, patient result visibility, pagination state, loading/error/empty states, and download recovery.
- Performance evidence: representative 500-report list payload and request timing before/after list projection and pagination.
