# Finance transaction register follow-up

Design references (patterns only; no external source code or packages copied):
- https://actualbudget.org/docs/accounts/
- https://ui.shadcn.com/docs/components/radix/data-table
API contract re-fetched: https://app.granter.biz/docs/granter-public-api.md on 2026-10-15.

Kept five navigation items. Transaction register uses readable date, description, account/payee, classification and signed amount; search, account/direction/unclassified filters, sorting, 20-row pagination and filtered CSV. Overview reuses compact six-row register. Mobile rows do not require horizontal scrolling. Native modal dialog provides focus containment, Escape close and background inertness.

Ticket detail is fetched only on opening via POST tickets/detail. Server rechecks owner, connection, ticket ID/type, workspace and returned identity before sanitization. No provider mutation or financial issuance used to test. Current ticketReferences displayed instead of deprecated connection flag. Contact string and object forms normalized. Unknown detail responses show errors, never successful empty details. Contact limit shown as latest 100 per official contract. Type changes fetch immediately; periodic refresh uses applied query.

New tests cover account extraction, contact forms, V2 references, combined filters, inclusion flags, refund sign and unknown amounts. Existing form-validation and database replay/permission tests retained. Live financial issuance, extra companies and cost-backed profitability remain outside the verified scope and require actual business inputs/provider permissions.
