# src/components/legal

`LegalShell.tsx` — the layout for the legal pages (`screens/legal/*`) and its
building blocks: `Bullets`, `Note`, and `RecoveryPeriod`.

`<RecoveryPeriod />` prints the account recovery period from the server
(`useAccountPolicy` → `GET /api/public/account-policy`), for example "30 days".
It shows "the recovery period" while loading or if the server can't be reached,
so the sentence still reads correctly.
