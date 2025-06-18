import { NextResponse } from "next/server";
import { rolePages } from "./lib/rolePages";
import { mockUser } from "./lib/mockUser";

// eslint-disable-next-line
export function middleware(request: any) {
  const { pathname } = request.nextUrl;
  const role = mockUser.role;

  const pagesForRole =
    role in rolePages ? rolePages[role as keyof typeof rolePages] : [];

  if (!pagesForRole.includes(pathname)) {
    return NextResponse.redirect(new URL("/401", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/master-coding",
    "/phaseIO",
    "/production",
    "/results",
    "/upload",
    "/branch-master",
    "/roles",
    "/users",
  ],
};
