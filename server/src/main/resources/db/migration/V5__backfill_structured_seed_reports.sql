-- Backfills template metadata for the two seeded reports that existed before
-- structured-report seeding was enabled. Idempotent: only touches rows whose
-- template_key is still NULL, so re-runs and already-backfilled databases are safe.
-- Plain JSON string literals keep this file parseable under both PostgreSQL and
-- the test H2 configuration.

UPDATE reports
SET template_key = 'CHEST_XRAY',
    template_version = 1,
    structured_content = '{"clinicalIndication":"Persistent cough; assess for focal air-space opacity.","technique":"PA and lateral chest radiographs.","comparison":"No prior study available for comparison.","findings":"Cardiomediastinal silhouette is within normal limits. The lungs are clear. No pleural effusion or pneumothorax.","impression":"No acute cardiopulmonary abnormality.","reportingProfessional":"Dr. Adaeze Nwosu","professionalTitle":"Consultant Radiologist"}'
WHERE id = '82e42dca-c7aa-3ced-b51e-86f16e71ba99'
  AND template_key IS NULL;

UPDATE reports
SET template_key = 'MRI_BRAIN',
    template_version = 1,
    structured_content = '{"clinicalIndication":"Intermittent headache; exclude intracranial structural abnormality.","technique":"Multiplanar multisequence MRI of the brain without intravenous contrast.","comparison":"No prior MRI available for comparison.","findings":"Normal brain volume and signal. No restricted diffusion, mass effect, hydrocephalus, or extra-axial collection.","impression":"No acute intracranial abnormality on this non-contrast examination.","reportingProfessional":"Dr. Adaeze Nwosu","professionalTitle":"Consultant Radiologist"}'
WHERE id = 'dcd5867c-4de9-3679-8d3b-cd74323a6b6b'
  AND template_key IS NULL;