import { NextResponse } from "next/server";

/**
 * Placeholder — replace with Prisma user creation + password hash + verification email.
 */
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "registration_not_implemented",
      message: "Sign up API will be enabled with the database milestone.",
    },
    { status: 501 },
  );
}
