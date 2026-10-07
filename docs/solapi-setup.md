# SOLAPI diagnosis notifications

Production-only secrets: SOLAPI_API_KEY, SOLAPI_API_SECRET.
Config: SOLAPI_SENDER, DIAGNOSIS_ADMIN_PHONE, DIAGNOSIS_SMS_ENABLED=true.
DIAGNOSIS_NOTIFICATIONS_ENABLED is the master switch. Preview never sends.

New submissions atomically create applicant/admin SMS jobs in addition to the existing email/Alimtalk jobs. Existing submissions are not backfilled. The after-response handler sends only newly created submissions; each job must atomically transition pending -> sending. Timeouts and unconfirmed provider responses become uncertain and are never automatically retried. accepted means provider acceptance, not delivery to the handset.

Applicant uses LMS until Alimtalk is configured. Approved SOLAPI_PFID, SOLAPI_TEMPLATE_ID and DIAGNOSIS_ALIMTALK_ENABLED=true switch the applicant to Alimtalk with provider-managed SMS fallback; direct applicant SMS is suppressed to prevent duplicates. The approved template must have exactly the #{이름} variable and match the MongPD receipt purpose. Admin notification remains LMS. Emails remain enabled.

Owner-only GET /api/integrations/solapi validates HMAC credentials using the read-only balance API. It returns no credentials or account balance. No test messages are sent.

2026-10-07: SMS integration prepared; no approved Alimtalk template exists. Production environment Secret is entered directly by the user, never committed. Sender is a verified number observed in SOLAPI. Database migration does not grant new access.
