# Supabase Setup and Policies

## Table Policies (RLS)

| Schema | Table | Policy Name | Permissive | Roles | Cmd | Qual | With Check |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| public | references | Enable insert for authenticated users only | PERMISSIVE | {authenticated} | INSERT | null | true |
| public | references | Enable update for authenticated users only | PERMISSIVE | {authenticated} | UPDATE | true | true |
| public | references | Public read access for references | PERMISSIVE | {public} | SELECT | true | null |
| public | viator\_tours | Enable ALL for Admin on viator\_tours | PERMISSIVE | {public} | ALL | ((auth.jwt() ->> 'email'::text) = 'admin@archaeolist.com'::text) | ((auth.jwt() ->> 'email'::text) = 'admin@archaeolist.com'::text) |
| public | unesco\_sites | Enable insert for authenticated users only | PERMISSIVE | {authenticated} | INSERT | null | true |
| public | unesco\_sites | Enable update for authenticated users only | PERMISSIVE | {authenticated} | UPDATE | true | true |
| public | unesco\_sites | Public read access for unesco\_sites | PERMISSIVE | {public} | SELECT | true | null |
| public | sites | Enable ALL for Admin on sites | PERMISSIVE | {public} | ALL | ((auth.jwt() ->> 'email'::text) = 'admin@archaeolist.com'::text) | ((auth.jwt() ->> 'email'::text) = 'admin@archaeolist.com'::text) |
| public | sites | Enable Read Access for Public on sites | PERMISSIVE | {public} | SELECT | true | null |
| public | sites | Enable insert for authenticated users only | PERMISSIVE | {authenticated} | INSERT | null | true |
| public | sites | Enable update for authenticated users only | PERMISSIVE | {authenticated} | UPDATE | true | true |
| public | sites | Public read access for sites | PERMISSIVE | {public} | SELECT | true | null |
| public | viator\_destinations | Enable ALL for Admin on viator\_destinations | PERMISSIVE | {public} | ALL | ((auth.jwt() ->> 'email'::text) = 'admin@archaeolist.com'::text) | ((auth.jwt() ->> 'email'::text) = 'admin@archaeolist.com'::text) |

## Admin Access
- **Admin Email**: `admin@archaeolist.com`
- **Privileges**: Full Access (ALL) to `sites`, `viator_tours`, `viator_destinations` via specific RLS policies checking the JWT email claim.

## Notes
- **Authentication**: Uses Supabase Auth.
- **Service Role**: Backend scripts (`src/lib/viator/sync.ts` etc.) use the Service Role Key to bypass RLS.
- **Frontend Admin**: Uses `@refinedev/supabase` with the standard Anon Key + User Session.
