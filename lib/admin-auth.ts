import { cookies } from "next/headers";

export const ADMIN_COOKIE = "bubu_admin";

// The cookie simply holds the passcode; every admin route re-checks it
// against the env var, so rotating ADMIN_PASSCODE invalidates all sessions.
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const expected = process.env.ADMIN_PASSCODE;
  return Boolean(expected) && store.get(ADMIN_COOKIE)?.value === expected;
}
