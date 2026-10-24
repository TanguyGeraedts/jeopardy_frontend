import { clerkMiddleware } from "@clerk/nextjs/server";

// Clerk keeps the session in sync on page requests. It doesn't block anything: pages that need a login use
// <RequireAuth>, and the Spring backend checks the token on every API call.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Every page, except Next.js internals, static files and /api. /api is only forwarded to Spring (which checks the
    // Clerk token itself); leaving it out keeps the players' live stream and buzzes untouched.
    "/((?!_next|api/|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp3)).*)",
  ],
};
