import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import constants from "../../electron/constants";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log(!user && req.nextUrl.pathname === "/" ? "t" : "f");

  if (
    constants.isAuthEnabled &&
    !user &&
    constants.protectedRoutes.includes(req.nextUrl.pathname)
  ) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/", "/account"],
};
