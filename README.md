# Jane Doe — Original painting gallery

Milestone one: Next.js 16.3 App Router, React 19, TypeScript, Tailwind 4, Supabase Auth/Postgres/private Storage, and shadcn/ui-style local Button/Input components with Radix Slot and CVA. Deploy with Vercel's Next.js preset. No payments or inquiry collection are included.

## Local development

1. `npm ci` (Node 22.18+ recommended).
2. Copy `.env.example` to `.env.local`. In the existing Supabase project, copy the Project URL and **publishable** key from Project Settings → API. A legacy anon key also works in the publishable-key variable. These values are designed to be public; authorization comes from RLS. Never add a service-role/secret key to this application.
3. Apply `supabase/migrations/202611060001_gallery.sql` to the existing project using the SQL editor, or link the Supabase CLI and run `supabase db push`. Review existing database/storage policies first: this migration creates new tables and a new `paintings` bucket, and deliberately fails if those already exist rather than changing unrelated work. The migration is transactional and tracked by CLI migration history.
4. Disable **Allow new users to sign up** under Authentication → Sign In / Providers. Disable anonymous sign-ins and unused providers. There is no application registration endpoint. Enable Supabase Auth rate limits and production email delivery as appropriate.
5. Create Jane's account from Authentication → Users → Add user, with a strong password, marking the email confirmed. Do not place passwords in source or SQL files. Copy its UUID and run the following in the privileged SQL editor, replacing the placeholder:
   ```sql
   insert into public.artist_access (singleton, user_id)
   values (true, 'ARTIST_AUTH_USER_UUID');
   ```
   Only one row is permitted. Authenticated users cannot read or modify this allowlist. Provisioning a different account alone grants no admin rights. To rotate the artist account, update this singleton through the SQL editor, then revoke the old account's sessions.
6. Set Supabase Auth Site URL to your production HTTPS URL, with `http://localhost:3000` as a development redirect URL. This milestone uses email/password sign-in, without an OAuth callback.
7. `npm run dev`, then open http://localhost:3000. `/admin` redirects to sign-in. Without env values the public site renders an honest empty gallery and the login page explains setup; it never substitutes demo paintings.

Artist password recovery: use Supabase's user-management tools to send a recovery invitation or administratively set a new password through the dashboard/secure Admin API. This milestone does not implement an application recovery callback; do not send recovery links to an unimplemented route. For a lost password, a project owner can securely reset it through privileged Supabase tooling.

## Vercel

Import the repository, keep the Next.js framework preset and default build command (`npm run build`). Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for each deployment environment, then redeploy. Use the same configured Supabase project only where intended. Apply migrations and provision the artist before production use. No service-role key is needed. Server Actions allow 4 MB requests; photos are capped at 3 MB to fit Vercel's function request limit including form overhead. Runtime is Node for image processing.

Change the artist name in `lib/painting.ts` and the small Jane Doe editorial/metadata strings in `app/` to rebrand. Public styles are in `app/globals.css`. shadcn configuration is in `components.json`; local UI source is in `components/ui`.

## Data and privacy

- `visibility` (`draft`, `published`, `hidden`) is independent of `availability` (`available`, `sold`). Published Sold works stay visible.
- Draft fields can be empty. Supplied dimensions must be positive and at most 10,000 inches; database and form enforce three decimal places at storage precision. Publishing requires width, height, and an existing uploaded photo. Title fallback is Untitled. Optional fields are omitted publicly. USD prices are integer cents, parsed from decimal strings without floating-point multiplication.
- Painting rows contain only intended public artwork data plus identifier/publication metadata. Anonymous SELECT is restricted to published rows. Artist writes and private reads require the singleton artist UUID using `auth.uid()` and RLS.
- The `paintings` bucket is **private**. Public Storage SELECT is restricted to the photo currently attached to a published painting. Unattached, draft, and hidden photos have no public access. Never change this bucket to public or add broad policies. No signed URLs are created.
- `/artwork/[id]` downloads through the caller's RLS context, never a service key, with `private, no-store` and `nosniff`. Hiding immediately denies subsequent photo requests, including direct Storage downloads. Already downloaded images cannot be recalled from a visitor's device.
- All admin pages and mutations call `requireArtist()`, which verifies the current user with Supabase and then checks `is_artist()`. The proxy refreshes session cookies; it is not the authorization boundary. Server Actions also retain Next's same-origin protections.
- Images are decoded with Sharp (40 megapixel input limit), rotated, resized within 2400 × 2400 without cropping, stripped of metadata, and encoded to WebP. JPEG/PNG/WebP only, no SVG or animation. New unique paths prevent stale replacement images. Failed saves clean up the new upload when possible; old photos are deleted only after the row changes. Interrupted requests may leave private orphan objects, which may be cleaned up by the project owner. Bucket policies deny deleting attached photos.
- An artist with direct API access is a trusted administrator and can upload WebP objects directly; the app's image processing is additional validation. RLS still protects all visibility and ownership boundaries.

## Checks and acceptance

```
npm run lint
npm run typecheck
npm test
npm run build
```

`tests/painting.test.ts` checks field validation, decimal prices, Untitled fallback, optional fields, and publish preconditions. `supabase/tests/rls.sql` is a rollback-only SQL test for anonymous/non-artist access and database publish constraints; run it in the SQL editor **after** migration. It does not replace end-to-end testing against configured Storage/Auth.

With a configured project, perform this acceptance check before launch:

1. In a private browser visit `/admin` → sign in as Jane → Create a painting. Save with no fields: it remains a private Untitled draft. Verify the row and `/artwork/ID` are inaccessible in a signed-out browser and through direct anonymous Supabase requests.
2. Attempt Save & publish without a photo/dimensions: clear validation error, no publication. Try zero/negative dimensions, a malformed price, renamed non-image bytes, oversized upload, and a second non-artist account.
3. Upload a real photo, enter positive width/height, Save draft, reopen and confirm persistence. Publish. Verify homepage, gallery, detail and full canvas in portrait/landscape formats at 390px and 1440px widths. Leave optional fields blank and confirm they are omitted and Untitled is displayed.
4. Mark Sold and Save & publish: visible with Sold label. Replace photo and confirm full image and new photo. Save & hide: detail returns 404 and both app photo URL and direct Storage request deny public access. Admin still sees it. Save draft similarly removes publication.
5. Try mutations with no session and a non-artist session (both app actions and Supabase REST/Storage). Confirm failures and no changed data. Sign out and confirm `/admin` requires sign-in again.

Configuration and live acceptance require access to the existing Supabase project; credentials are intentionally not included in the repository. See `VALIDATION.md` for the checks actually performed during implementation.
