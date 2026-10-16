# src/components/legal

`LegalShell.tsx` — the layout for the legal pages (`screens/legal/*`) and its
building blocks: `Bullets`, `Note`, and `RecoveryPeriod`.

`<RecoveryPeriod />` prints the account recovery period from the server
(`useAccountPolicy` → `GET /api/public/account-policy`), for example "30 days".
It shows "the recovery period" while loading or if the server can't be reached,
so the sentence still reads correctly.

`<RecoveryPeriodOf />` prints " of 30 days" once the period is known and nothing
otherwise. Use it after "a recovery period", where the fallback would read "a
recovery period of the recovery period", including in the server-rendered HTML.
