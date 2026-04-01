import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

// Protect dashboard + API routes. Webhooks and public pages are excluded.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/patients/:path*",
    "/api/messages/:path*",
    "/api/campaigns/:path*",
    "/api/analytics/:path*",
    "/api/appointments/:path*",
  ],
};
