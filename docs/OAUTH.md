# Google & GitHub login (Supabase)

The app already implements OAuth in the browser (`signInWithOAuth`) and exchanges the code at `/auth/callback` (PKCE). You only need to **turn on providers in Supabase** and **register redirect URLs** in Google Cloud and GitHub using Supabase’s callback URL.

## 1. Supabase — URLs

In **Supabase Dashboard → Authentication → URL Configuration**:

| Setting | Example (local dev) |
|--------|------------------------|
| **Site URL** | `http://localhost:3000` |
| **Redirect URLs** | Add `http://localhost:3000/auth/callback` and, for production, `https://your-domain.com/auth/callback` |

You can also allow a wildcard for dev, e.g. `http://localhost:3000/**`, if your project settings allow it.

Your app sends users to:

`{origin}/auth/callback?next=/app` (or another safe path from the login form).

## 2. Google

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → **Credentials** → **Create OAuth client ID** (Web application).
2. **Authorized JavaScript origins** (optional for this flow): your site origin, e.g. `http://localhost:3000`.
3. **Authorized redirect URIs** — use Supabase’s endpoint (not your Next app URL):

   `https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback`

4. Copy **Client ID** and **Client secret**.
5. **Supabase → Authentication → Providers → Google**: enable, paste ID and secret, save.

## 3. GitHub

1. GitHub → **Settings → Developer settings → OAuth Apps** → **New OAuth App**.
2. **Homepage URL**: e.g. `http://localhost:3000` (or production URL).
3. **Authorization callback URL** — must be Supabase’s callback:

   `https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback`

4. Copy **Client ID** and generate a **Client secret**.
5. **Supabase → Authentication → Providers → GitHub**: enable, paste ID and secret, save.

## 4. Environment

Copy `.env.example` to `.env` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

No Google/GitHub secrets belong in the Next.js env file — those stay in the Supabase Dashboard.

## 5. Verify

1. `npm run dev`, open `/login` or `/signup`.
2. Click **Google** or **GitHub**; complete the provider flow.
3. You should land on `/app` (or the `next` path from the callback) with a session cookie.

If something fails, check Supabase **Authentication → Logs** and that redirect URLs match exactly (scheme, host, path).
