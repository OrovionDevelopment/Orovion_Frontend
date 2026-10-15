# src/screens/legal

`Terms.tsx`, `PrivacyPolicy.tsx`, `HelpCenter.tsx`, rendered inside
`components/legal/LegalShell`.

## The account-deletion wording

Terms and Privacy describe what the server actually does:

1. **Delete** is a soft delete. The account is hidden at once and restored by
   logging in with the same phone number, Google or Apple account within the
   recovery period.
2. After that period it is **archived**: it can't be restored by the user, its
   login identifiers are released, and the data is kept under the retention
   rules.
3. **Only an administrator can erase permanently.**

The length of the period is never typed into the text. `<RecoveryPeriod />`
renders the server's value (`GET /api/public/account-policy`, e.g. "30 days").
Hard-coded wording is how these pages said "six (6) months" while the server
used 30 days.

**This wording needs legal review** before it is relied on.

`HelpCenter.tsx` renders `src/lib/faq.ts`, whose account answers state no number
on purpose: the same text feeds the server-rendered FAQ JSON-LD, which can't
read the live setting.
